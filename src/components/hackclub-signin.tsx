"use client";

import { authClient } from "@/lib/auth-client";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { LogIn } from "lucide-react";

export function HackClubSignIn() {
  const handleClick = async () => {
    await authClient.signIn.oauth2({
      providerId: "hackclub",
    });
  };

  return (
    <DropdownMenuItem onSelect={handleClick}>
      <LogIn />
      Sign in with Hack Club
    </DropdownMenuItem>
  );
}
