import {
  streamText,
  convertToModelMessages,
  validateUIMessages,
  generateId,
  smoothStream,
} from "ai";
import { NextResponse } from "next/server";
import { createHackclub } from "@/lib/hackclub";
import { system } from "./system";
import { plugins } from "./plugins";
import { auth } from "@/lib/auth";
import {
  deleteMessage,
  loadChat,
  setLastModel,
  upsertMessage,
} from "@/lib/db/actions";
import { Message, MessageMetadata, metadataSchema } from "@/types/message";

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
        await setLastModel(chatId, model);

        toSendMessages.push(message);
      }

      const validatedMessages = await validateUIMessages<Message>({
        messages: toSendMessages,
        metadataSchema,
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
          usage: {
            include: true,
          },
        }),
        // TODO: allow temp control, etc
        temperature: 0.3,
        messages: convertToModelMessages(validatedMessages),
        system: system({ webSearch }),
        experimental_transform: smoothStream({
          chunking: "word",
          delayInMs: 5,
        }),
      });

      result.consumeStream();

      return result.toUIMessageStreamResponse<Message>({
        sendSources: true,
        sendReasoning: true,
        generateMessageId: () => generateId(),
        messageMetadata: ({ part }) => {
          if (part.type === "finish-step") {
            return {
              usage: part.providerMetadata?.openrouter.usage,
            } as MessageMetadata;
          }

          return {};
        },
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
