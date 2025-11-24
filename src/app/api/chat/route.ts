import { getSession } from "@/app/actions";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  smoothStream,
} from "ai";
import { NextResponse } from "next/server";
import { BASE } from "@/lib/hackclub";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import system from "./system.md";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await getSession();

  if (!session.apiKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const {
    messages,
    model,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } =
    await req.json();

  const provider = createOpenRouter({
    baseURL: BASE,
    apiKey: session.apiKey,
    compatibility: "strict",
  });

  const result = streamText({
    model: provider.chat(model),
    messages: convertToModelMessages(messages),
    system: system.replaceAll(
      "{{current_date}}",
      new Date().toLocaleDateString(),
    ),
    experimental_transform: smoothStream(),
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
