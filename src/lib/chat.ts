import { nanoid } from "nanoid";

export function generateChatId(): string {
  return nanoid(32);
}
