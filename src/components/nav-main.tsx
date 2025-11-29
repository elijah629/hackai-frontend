import { Edit } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createChat } from "@/lib/db/actions";
import Form from "next/form";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Form action={createChat}>
            <SidebarMenuButton
              tooltip="New chat"
              type="submit"
              className="cursor-pointer"
            >
              <Edit />
              New chat
            </SidebarMenuButton>
          </Form>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
