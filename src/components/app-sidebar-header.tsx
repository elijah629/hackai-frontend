import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Hackclub } from "./icons/hackclub";
import { Button } from "./ui/button";
import Link from "next/link";
import { PanelLeftIcon } from "lucide-react";

export function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between">
        <Button
          size="icon"
          className="size-9 group-data-[collapsible=icon]:hidden"
          variant="ghost"
          asChild
        >
          <Link href="/">
            <Hackclub />
          </Link>
        </Button>
        <SidebarTrigger className="size-9 hidden group/sb-trigger group-data-[collapsible=icon]:inline-flex">
          <Hackclub className="flex group-hover/sb-trigger:hidden" />
          <PanelLeftIcon className="size-4 hidden group-hover/sb-trigger:block" />
        </SidebarTrigger>
        <SidebarTrigger className="size-9 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0 transition-opacity">
          <PanelLeftIcon className="size-4" />
        </SidebarTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
