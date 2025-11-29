import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Edit, Menu } from "lucide-react";
import Image from "next/image";
import orpheus from "@/images/flag-orpheus-top.svg";
import { createChat } from "@/lib/db/actions";
import Form from "next/form";

export function Header() {
  return (
    <header className="border-b md:hidden items-center px-2 flex justify-between">
      <SidebarTrigger className="size-9">
        <Menu className="size-6" />
      </SidebarTrigger>
      <Image alt="Hack club" width={103} height={58} src={orpheus.src} />
      <Form action={createChat}>
        <Button
          variant="ghost"
          size="icon-sm"
        >
          <Edit className="size-6" />
        </Button>
      </Form>
    </header>
  );
}
