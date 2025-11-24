"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Edit, Menu } from "lucide-react";
import Image from "next/image";
import orpheus from "@/images/flag-orpheus-top.svg";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export function Header() {
  const router = useRouter();

  return (
    <header className="border-b md:hidden items-center px-2 flex justify-between">
      <SidebarTrigger className="size-9">
        <Menu className="size-6" />
      </SidebarTrigger>
      <Image alt="Hack club" width={103} height={58} src={orpheus.src} />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          router.push(`/c/${nanoid()}`);
        }}
      >
        <Edit className="size-6" />
      </Button>
    </header>
  );
}
