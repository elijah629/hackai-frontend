import * as models from "@openrouter/sdk/models";

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
    return [{ id: "web" }];
  }

  return [];
}
