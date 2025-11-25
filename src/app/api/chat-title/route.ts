import { getSession } from "@/app/actions";
import { createHackclub } from "@/lib/hackclub";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import z from "zod";

export const maxDuration = 15;

export async function POST(req: Request) {
  const { apiKey } = await getSession();

  if (!apiKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { prompt }: { prompt: string } = await req.json();

  const provider = createHackclub({ apiKey });

  const {
    object: { title, emoji },
  } = await generateObject({
    model: provider.chat("openai/gpt-oss-120b"),
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
}
