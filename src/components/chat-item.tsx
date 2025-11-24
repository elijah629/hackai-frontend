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
import { ChatRow, db } from "@/lib/chat-store";
import { useState } from "react";
import { RenameChatDialog } from "./rename-chat-dialog";

export function ChatItem({ chat }: { chat: ChatRow }) {
  const { isMobile } = useSidebar();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
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
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => db.chats.delete(chat.id)}
            >
              <Trash2 className="text-muted-foreground" />
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <RenameChatDialog
        id={chat.id}
        name={chat.title}
        icon={chat.icon}
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
      />
    </>
  );
}
