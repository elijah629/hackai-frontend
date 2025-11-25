import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDisplayModelName(chef: string, fullName: string): string {
  let name = fullName.replace(new RegExp(`^${chef}\\s*:\\s*`, "i"), "").trim();

  let combined = `${chef} ${name}`.trim();

  const dupPattern = new RegExp(`^(${chef})\\s+\\1\\b`, "i");
  combined = combined.replace(dupPattern, "$1");

  const dropChefCompletelyFor = ["Google"];

  if (
    dropChefCompletelyFor.some((c) => c.toLowerCase() === chef.toLowerCase())
  ) {
    return name;
  }

  return combined;
}
