import systemCoC from "./system-coc.md";
import systemIntro from "./system-intro.md";
import systemFormat from "./system-format.md";

export function system(): string {
  const parts: (string | false)[] = [
    systemIntro.replaceAll("{{current_date}}", new Date().toLocaleDateString()),
    systemCoC,
    systemFormat,
  ];

  return parts
    .filter((x) => x !== false)
    .join("\n\n\n")
    .trim();
}
