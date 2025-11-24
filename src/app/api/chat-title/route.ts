import { getSession } from "@/app/actions";
import { BASE } from "@/lib/hackclub";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import z from "zod";

export const maxDuration = 15;

export async function POST(req: Request) {
  const session = await getSession();

  if (!session.apiKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { prompt }: { prompt: string } = await req.json();

  const provider = createOpenRouter({
    baseURL: BASE,
    apiKey: session.apiKey,
    compatibility: "strict",
  });

  try {
    const {
      object: { title, emoji },
    } = await generateObject({
      model: provider.chat("openai/gpt-5-mini"),
      schema: z.object({
        title: z.string(),
        emoji: z.string(),
      }),
      system: `Given the user’s query, generate an object of the form \`{ title: string; emoji: string }\`.
* \`title\` must be a concise noun phrase under 8 words (ideally ~3).
* \`emoji\` must be exactly one emoji character.
- Return only the object, with no extra text.`,
      prompt: `The user's query is: \`\`\`${prompt}\`\`\``,
    });

    return NextResponse.json({ title, emoji });
  } catch {
    return NextResponse.json({ title: "New Chat", emoji: "💬" });
  }
}
