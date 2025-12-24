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
import { ModelParameters } from "@/types/model-parameters";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.apiKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const apiKey = session.user.apiKey;

  const requestParams: {
    id?: string;
    message?: Message;
    model?: string;
    webSearch?: boolean;
    regenerate?: boolean;
    parameters?: Partial<ModelParameters>;
  } = await req.json();

  const chatId = requestParams.id;
  const message = requestParams.message;

  if (!chatId || !message) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const model = requestParams.model ?? "google/gemini-2.5-flash";
  const webSearch = requestParams.webSearch ?? false;
  const parameters = requestParams.parameters ?? {
    temperature: 0.3,
  };

  const regenerate = requestParams.regenerate ?? false;

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
          web_search_options: webSearch
            ? ({
                search_context_size: "high",
              } as any)
            : undefined,
        }),
        temperature: parameters.temperature,
        messages: convertToModelMessages(validatedMessages),
        system: system(),
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
