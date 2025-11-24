"use client";

import { ChevronsUpDown, Gauge, Key, LogOut, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ApiKeyDialog } from "./api-key-dialog";
import { useState } from "react";
import { logout } from "@/app/actions";
import { ThemeToggle } from "./theme-toggle";
import { db } from "@/lib/chat-store";
import { useLiveQuery } from "dexie-react-hooks";

export function NavUser({ hasApiKey }: { hasApiKey: boolean }) {
  const { isMobile } = useSidebar();
  const chatCount = useLiveQuery(() => db.chats.count());
  const [showApiKeyDialog, setApiKeyDialog] = useState(false);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">h</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">hackclubber</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">h</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">hackclubber</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setApiKeyDialog(true)}>
                  <Key />
                  Set API Key
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/usage">
                    <Gauge />
                    Usage &amp; Models
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <ThemeToggle />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={chatCount === 0}
                onSelect={() => db.chats.clear()}
                variant="destructive"
              >
                <Trash2 />
                Delete all chats
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!hasApiKey}
                onSelect={logout}
                variant="destructive"
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <ApiKeyDialog open={showApiKeyDialog} onOpenChange={setApiKeyDialog} />
    </>
  );
}
