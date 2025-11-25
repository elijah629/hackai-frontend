import { getSession } from "@/app/actions";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  smoothStream,
} from "ai";
import { NextResponse } from "next/server";
import { createHackclub } from "@/lib/hackclub";
import { system } from "./system";
import { plugins } from "./plugins";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { apiKey } = await getSession();

  if (!apiKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const {
    messages,
    model,
    webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } =
    await req.json();

  const provider = createHackclub({ apiKey });

  const result = streamText({
    model: provider.chat(model, {
      plugins: plugins({ webSearch }),
    }),
    temperature: 0.3,
    messages: convertToModelMessages(messages),
    system: system({ webSearch }),
    experimental_transform: smoothStream(),
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
