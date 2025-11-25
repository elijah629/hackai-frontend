"use client";

import { Streamdown } from "../../streamdown/packages/streamdown";

export function ModelMarkdown({ children }: { children: string | undefined }) {
  return (
    <Streamdown
      mode="static"
      className="text-xs leading-snug text-muted-foreground"
    >
      {children}
    </Streamdown>
  );
}
