import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavChats } from "@/components/nav-chats";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./app-sidebar-header";
import { getSession } from "@/app/actions";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavChats />
      </SidebarContent>
      <SidebarFooter>
        <NavUser hasApiKey={session.apiKey !== undefined} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
