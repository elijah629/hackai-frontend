"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { db } from "@/lib/chat-store";
import { useLiveQuery } from "dexie-react-hooks";
import { ChatItem } from "./chat-item";

export function NavChats() {
  const chats = useLiveQuery(
    () => db.chats.orderBy("updatedAt").reverse().toArray(),
    [],
    [],
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Your Chats</SidebarGroupLabel>
      <SidebarMenu>
        {chats.map((chat) => (
          <ChatItem chat={chat} key={chat.id} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
