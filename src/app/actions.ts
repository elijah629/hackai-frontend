"use server";

import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";

export async function getSession() {
  return await getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function logout() {
  const session = await getSession();
  session.destroy();

  revalidatePath("/");
}

export async function setApiKey(formData: FormData) {
  const session = await getSession();

  session.apiKey = (formData.get("apiKey") ?? undefined) as string | undefined;

  await session.save();

  revalidatePath("/");
}
