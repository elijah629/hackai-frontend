import systemCoC from "./system-coc.md";
import systemIntro from "./system-intro.md";
import systemWeb from "./system-web.md";
import systemFormat from "./system-format.md";

export function system({ webSearch }: { webSearch: boolean }): string {
  const parts: (string | false)[] = [
    systemIntro.replaceAll("{{current_date}}", new Date().toLocaleDateString()),
    webSearch && systemWeb,
    systemCoC,
    systemFormat,
  ];

  return parts
    .filter((x) => x !== false)
    .join("\n\n\n")
    .trim();
}
