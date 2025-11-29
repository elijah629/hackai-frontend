import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

import { ChatItem } from "./chat-item";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  deleteChat,
  getChatsFor,
  renameChat,
  setPublicity,
} from "@/lib/db/actions";

export async function NavChats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return;
  }

  const userChats = await getChatsFor(session.user.id);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Your Chats</SidebarGroupLabel>
      <SidebarMenu>
        {userChats.map((chat) => (
          <ChatItem
            chat={chat}
            onDelete={async () => {
              "use server";
              await deleteChat(chat.id);
            }}
            onRename={async (icon, title) => {
              "use server";
              await renameChat(chat.id, icon, title);
            }}
            setPublicity={async (isPublic) => {
              "use server";
              await setPublicity(chat.id, isPublic);
            }}
            key={chat.id}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
