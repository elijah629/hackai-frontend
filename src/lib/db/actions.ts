"use server";

// Largely infered from https://v6.ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence#storing-messages
// and https://github.com/vercel-labs/ai-sdk-persistence-db

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Chat, chats, messages, parts } from "./schema/chat";
import { and, eq, gt } from "drizzle-orm";
import {
  mapDBPartToUIMessagePart,
  mapUIMessagePartsToDBParts,
  Message,
} from "@/types/message";
import { headers } from "next/headers";
import { cacheTag, revalidatePath, updateTag } from "next/cache";
import { redirect, unauthorized } from "next/navigation";

// Mutations

export async function setApiKey(formData: FormData) {
  const h = await headers();

  const session = await auth.api.getSession({
    headers: h,
  });

  if (!session?.user) {
    unauthorized();
  }

  await auth.api.updateUser({
    body: {
      apiKey: (formData.get("apiKey") ?? undefined) as string | undefined,
    },
    headers: h,
  });
}

export async function createChat() {
  const h = await headers();

  const session = await auth.api.getSession({
    headers: h,
  });

  if (!session?.user) {
    const { url } = await auth.api.signInWithOAuth2({
      body: {
        providerId: "hackclub",
        callbackURL: "/",
      },
      headers: h,
    });

    redirect(url);
  }

  const [{ id, userId }] = await db
    .insert(chats)
    .values({
      userId: session.user.id,
    })
    .returning({ userId: chats.userId, id: chats.id });

  updateTag(`user-chats:${userId}`);

  redirect(`/c/${id}`);
}

export async function setLastModel(chatId: string, lastModel: string) {
  await db.update(chats).set({ lastModel }).where(eq(chats.id, chatId));
}

export async function setPublicity(chatId: string, publicity: boolean) {
  const [{ userId }] = await db
    .update(chats)
    .set({ isPublic: publicity })
    .where(eq(chats.id, chatId))
    .returning({ userId: chats.userId });

  updateTag(`user-chats:${userId}`);

  revalidatePath("/c/" + chatId, "page");
}

export async function deleteChat(chatId: string) {
  const [deletedChat] = await db
    .delete(chats)
    .where(eq(chats.id, chatId))
    .returning({ userId: chats.userId, id: chats.id });

  if (deletedChat) {
    revalidatePath("/c/" + deletedChat.id, "page");
    updateTag(`user-chats:${deletedChat.userId}`);
  }
}

export async function deleteAllChats(userId: string) {
  const c = await db
    .delete(chats)
    .where(eq(chats.userId, userId))
    .returning({ id: chats.id });

  updateTag(`user-chats:${userId}`);

  for (const chat of c) {
    revalidatePath("/c/" + chat.id, "page");
  }
}

export async function deleteMessage(chatId: string, messageId: string) {
  await db.transaction(async (tx) => {
    const [targetMessage] = await tx
      .select()
      .from(messages)
      .where(and(eq(messages.id, messageId), eq(messages.chatId, chatId)))
      .limit(1);

    if (!targetMessage) return;

    // Delete all messages after this one in the chat
    await tx
      .delete(messages)
      .where(
        and(
          eq(messages.chatId, targetMessage.chatId),
          gt(messages.createdAt, targetMessage.createdAt),
        ),
      );

    // Delete the target message (cascade delete will handle parts)
    await tx.delete(messages).where(eq(messages.id, messageId));
  });
}

export async function renameChat(chatId: string, icon: string, title: string) {
  const [{ userId }] = await db
    .update(chats)
    .set({ icon, title })
    .where(eq(chats.id, chatId))
    .returning({ userId: chats.userId });

  updateTag(`user-chats:${userId}`);

  revalidatePath("/c/" + chatId, "page");
}

export async function upsertMessage({
  chatId,
  message,
  id,
}: {
  id: string;
  chatId: string;
  message: Message;
}) {
  const mappedDBUIParts = mapUIMessagePartsToDBParts(message.parts, id);

  await db.transaction(async (tx) => {
    await tx
      .insert(messages)
      .values({
        chatId,
        role: message.role,
        metadata: message.metadata,
        id,
      })
      .onConflictDoUpdate({
        target: messages.id,
        set: {
          chatId,
        },
      });

    await tx.delete(parts).where(eq(parts.messageId, id));
    if (mappedDBUIParts.length > 0) {
      await tx.insert(parts).values(mappedDBUIParts);
    }
  });
}

// Read

export async function loadChat(
  chatId: string,
  userId?: string,
): Promise<
  | { type: "chat"; chat: Chat; editable: boolean }
  | { type: "unauthorized" }
  | { type: "forbidden" }
  | { type: "not-found" }
> {
  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    with: {
      messages: {
        with: {
          parts: {
            orderBy: (parts, { asc }) => [asc(parts.order)],
          },
        },
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      },
    },
  });

  if (!chat) {
    return {
      type: "not-found",
    };
  }

  const isOwner = userId != null && chat.userId === userId;
  const isPublic = chat.isPublic;

  if (!isPublic) {
    if (!userId) {
      return { type: "unauthorized" };
    }

    if (!isOwner) {
      return { type: "forbidden" };
    }
  }

  return {
    type: "chat",
    editable: isOwner,
    chat: {
      id: chat.id,
      userId: chat.userId,
      lastModel: chat.lastModel,
      icon: chat.icon,
      title: chat.title,
      messages: chat.messages.map((message) => ({
        id: message.id,
        role: message.role,
        metadata: message.metadata ?? undefined,
        parts: message.parts.map((part) => mapDBPartToUIMessagePart(part)),
      })),
      isPublic: chat.isPublic,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    },
  };
}

export async function getChatsFor(userId: string) {
  "use cache";

  cacheTag(`user-chats:${userId}`);

  return await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: (chat, { desc }) => [desc(chat.updatedAt)],
  });
}

export async function userHasChats(userId: string) {
  "use cache";

  cacheTag(`user-chats:${userId}`);

  const result = await db.query.chats.findFirst({
    where: eq(chats.userId, userId),
    columns: { id: true },
  });

  return result !== undefined;
}
