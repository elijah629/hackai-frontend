"use client";

import { Check } from "lucide-react";

import {
  DropdownMenuItem,
  DropdownMenuSubTrigger,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useAccent } from "@/lib/accent";
import { capitalizeFirstLetter } from "better-auth/react";
export function AccentToggle() {
  const { setAccent, accent, accents } = useAccent();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <div className="h-[1.2rem] w-[1.2rem] rounded-full bg-primary" />
        <span>{capitalizeFirstLetter(accent)}</span>
        <span className="sr-only">Select accent</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {accents.map((a) => (
            <DropdownMenuItem key={a} onClick={() => setAccent(a)}>
              <div
                className="h-[1.2rem] w-[1.2rem] rounded-full"
                style={{
                  backgroundColor: "var(--" + a + ")",
                }}
              />
              {capitalizeFirstLetter(a)}{" "}
              {accent === a && <Check className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
