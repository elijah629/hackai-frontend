"use client";

import { Edit } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export function NavMain() {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="New chat" asChild>
            <Link
              href={`/`}
              onNavigate={(e) => {
                e.preventDefault();
                router.push(`/c/${nanoid()}`);
              }}
            >
              <Edit />
              <span>New chat</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
