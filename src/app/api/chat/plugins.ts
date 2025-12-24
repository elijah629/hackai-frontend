import * as models from "@openrouter/sdk/models";
import systemWeb from "./system-web.md";

export function plugins({ webSearch }: { webSearch: boolean }): Array<
  | {
      id: models.IdWeb;
      max_results?: number;
      search_prompt?: string;
      engine?: models.Engine;
    }
  | {
      id: models.IdFileParser;
      max_files?: number;
      pdf?: {
        engine?: models.PdfEngine;
      };
    }
  | {
      id: models.IdModeration;
    }
> {
  if (webSearch) {
    return [{ id: "web", search_prompt: systemWeb }];
  }

  return [];
}
