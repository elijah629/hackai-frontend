import { getSession } from "@/app/actions";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { NextResponse } from "next/server";
import { BASE } from "@/lib/hackclub";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 30;

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
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
