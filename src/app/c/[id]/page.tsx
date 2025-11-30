import { getModelList } from "@/lib/hackclub";
import { Chat } from "@/components/chat";
import { loadChat } from "@/lib/db/actions";
import { forbidden, redirect, unauthorized } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { StaticChat } from "@/components/chat/static";
import { Metadata } from "next";
import { ChatSkeleton } from "@/components/chat/skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const chat = await loadChat(id, session?.user.id);

  if (chat.type === "chat") {
    return {
      title: chat.chat.icon + " " + chat.chat.title,
    };
  } else {
    return {};
  }
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatGetter params={params} />
    </Suspense>
  );
}

async function ChatGetter({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const chat = await loadChat(id, session?.user.id);

  switch (chat.type) {
    case "chat":
      const models = await getModelList();

      if (chat.editable) {
        return (
          <Chat
            models={models}
            initialMessages={chat.chat.messages}
            id={id}
            initialModel={chat.chat.lastModel}
          />
        );
      } else {
        return (
          <StaticChat
            title={chat.chat.title}
            icon={chat.chat.icon}
            lastModel={models.find((model) => model.id === chat.chat.lastModel)}
            messages={chat.chat.messages}
          />
        );
      }
    case "unauthorized":
      unauthorized();
    case "forbidden":
      forbidden();
    case "not-found":
      redirect("/");
  }
}
