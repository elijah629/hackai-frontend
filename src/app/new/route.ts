import { createChat } from "@/lib/db/actions";

export async function GET() {
  await createChat();
}
