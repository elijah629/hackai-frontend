// "use client";

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
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ApiKeyDialog } from "./api-key-dialog";
import { ThemeToggle } from "./theme-toggle";
import { HackClubSignIn } from "./hackclub-signin";
import { DialogTrigger } from "./ui/dialog";
import { AvatarImage } from "@radix-ui/react-avatar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteAllChats, userHasChats } from "@/lib/db/actions";
import { AccentToggle } from "./accent-toggle";

export async function NavUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasChats =
    Boolean(session?.user.id) && (await userHasChats(session!.user.id));

  const name = session?.user.name;
  const image = session?.user.image as string | undefined;
  const loggedIn = Boolean(session?.user);

  const initials = name
    ?.split(" ")
    ?.map((x) => x[0])
    .join("")
    .toUpperCase();

  return (
    <ApiKeyDialog>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {initials ?? "h"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {name || "hackclubber"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={image} alt={name} />

                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {initials ?? "h"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {name || "hackclubber"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {loggedIn && (
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <Key />
                      Set API Key
                    </DropdownMenuItem>
                  </DialogTrigger>
                )}
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
                <AccentToggle />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {loggedIn && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={async () => {
                    "use server";

                    if (session) {
                      await deleteAllChats(session.user.id);
                    }
                  }}
                  disabled={!hasChats}
                >
                  <Trash2 />
                  Delete all chats
                </DropdownMenuItem>
              )}

              {loggedIn ? (
                <DropdownMenuItem
                  variant="destructive"
                  disabled={!loggedIn}
                  onSelect={async () => {
                    "use server";

                    await auth.api.signOut({
                      headers: await headers(),
                    });
                  }}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              ) : (
                <HackClubSignIn />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </ApiKeyDialog>
  );
}
