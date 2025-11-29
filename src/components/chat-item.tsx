"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";
import { RenameChatDialog } from "./rename-chat-dialog";
import { Chat } from "@/lib/db/schema/chat";

export function ChatItem({
  chat,
  onDelete,
  onRename,
}: {
  chat: Omit<Chat, "messages">;
  onDelete: () => void;
  onRename: (icon: string, title: string) => void;
}) {
  const { isMobile } = useSidebar();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild title={`${chat.icon} ${chat.title}`}>
          <Link href={`/c/${chat.id}`} className="flex items-center">
            <span className="size-5 inline-flex items-center justify-center">
              {chat.icon}
            </span>
            <span>{chat.title}</span>
          </Link>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <MoreHorizontal />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            <DropdownMenuItem onSelect={() => setRenameDialogOpen(true)}>
              <Pencil className="text-muted-foreground" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete()}>
              <Trash2 className="text-muted-foreground" />
              Delete chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <RenameChatDialog
        name={chat.title}
        icon={chat.icon}
        onRename={onRename}
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
      />
    </>
  );
}
