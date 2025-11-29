import {
  streamText,
  convertToModelMessages,
  validateUIMessages,
  generateId,
  generateObject,
} from "ai";
import { NextResponse } from "next/server";
import { createHackclub } from "@/lib/hackclub";
import { system } from "./system";
import { plugins } from "./plugins";
import { auth } from "@/lib/auth";
import { deleteMessage, loadChat, upsertMessage } from "@/lib/db/actions";
import { Message } from "@/types/message";
import z from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { chats } from "@/lib/db/schema/chat";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.apiKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const apiKey = session.user.apiKey;

  const {
    id: chatId,
    message,
    model,
    webSearch,
    regenerate,
  }: {
    id: string;
    message: Message;
    model: string;
    webSearch: boolean;
    regenerate: boolean;
  } = await req.json();

  const chat = await loadChat(chatId, session.user.id);

  switch (chat.type) {
    case "chat":
      const toSendMessages = [...chat.chat.messages];

      if (regenerate) {
        const last = toSendMessages.at(-1);

        if (last && last.role === "assistant") {
          toSendMessages.pop();

          await deleteMessage(chatId, last.id);
        }
      } else {
        await upsertMessage({ chatId, id: message.id, message });

        toSendMessages.push(message);
      }

      const validatedMessages = await validateUIMessages({
        messages: toSendMessages,
      });

      const provider = createHackclub({
        apiKey,
        fetch: async (input, init) => {
          const f = await fetch(input, init);

          if (!f.ok) {
            return new NextResponse(
              `data: {"choices":[{"delta":{"content":"\`\`\`text\\n${await f.text()}\\n\`\`\`"}}]}\n\ndata: [DONE]`,
            );
          }

          return f;
        },
      });

      const result = streamText({
        model: provider.chat(model, {
          plugins: plugins({ webSearch }),
        }),
        // TODO: allow temp control, etc
        temperature: 0.4,
        messages: convertToModelMessages(validatedMessages),
        system: system({ webSearch }),
        // experimental_transform: smoothStream({
        //  chunking: /.{3}/,
        // }),
      });

      result.consumeStream();

      return result.toUIMessageStreamResponse<Message>({
        sendSources: true,
        sendReasoning: true,
        generateMessageId: () => generateId(),
        onFinish: async ({ responseMessage }) => {
          await upsertMessage({
            chatId,
            id: responseMessage.id,
            message: responseMessage,
          });
        },
      });

    case "unauthorized":
      return new NextResponse("Unauthorized", { status: 401 });
    case "forbidden":
      return new NextResponse("Forbidden", { status: 403 });
    case "not-found":
      return new NextResponse("Not found", { status: 404 });
  }
}

async function generateTitle({
  apiKey,
  prompt,
}: {
  apiKey: string;
  prompt: string;
}): Promise<{
  emoji: string;
  title: string;
}> {
  const provider = createHackclub({ apiKey });

  const {
    object: { title, emoji },
  } = await generateObject({
    model: provider.chat("google/gemini-2.5-flash"),
    schema: z.object({
      title: z.string(),
      emoji: z.string(),
    }),
    system: `Given the user’s query, generate an object of the form \`{ title: string; emoji: string }\`.
* \`title\` must be a concise noun phrase under 8 words (ideally ~3).
* \`emoji\` must be exactly one emoji character.
- Return only the object, with no extra text.

Example:
- Input: How do I bake a cake?
- Output: { title: "Cake baking", emoji: "🎂" }`,
    prompt: `The user's query is: \`\`\`${prompt}\`\`\``,
  });

  return { title, emoji };
}
