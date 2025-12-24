import {
  createOpenRouter,
  OpenRouterProvider,
  OpenRouterProviderSettings,
} from "@openrouter/ai-sdk-provider";

export const BASE = "https://ai.hackclub.com/proxy/v1";

export interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

// Stripped down, only what I need for a good display
export type Model = RawModel & {
  chefSlug: string;
  chef: string;
};

export interface ModelArchitecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
}

export interface RawModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  architecture: ModelArchitecture;
}

/*export async function isValidApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(BASE + "/stats", {
      headers: {
        Authorization: "Bearer " + apiKey,
      },
    });

    if (res.status === 401 || res.status === 403) {
      return false;
    }

    if (!res.ok) {
      throw new Error(`Unexpected status code: ${res.status}`);
    }

    return true;
  } catch (err) {
    throw err;
  }
}*/

export async function getUsageMetrics(apiKey: string): Promise<UsageMetrics> {
  const body = await fetch(BASE + "/stats", {
    headers: {
      Authorization: "Bearer " + apiKey,
    },
  }).then((x) => x.text());

  try {
    return JSON.parse(body);
  } catch {
    throw new Error("API Error: " + body);
  }
}

export async function getModelList() {
  const rawModels = (
    (await fetch(BASE + "/models", {
      cache: "force-cache",
      next: { revalidate: 3600 },
    }).then((x) => x.json())) as { data: RawModel[] }
  ).data;

  const models: Model[] = rawModels.map((model) => ({
    ...model,
    chef: model.name.split(":")[0],
    chefSlug: model.id.split("/")[0],
  }));

  return models;
}

export function createHackclub(
  options?: OpenRouterProviderSettings,
): OpenRouterProvider {
  return createOpenRouter({
    baseURL: BASE,
    compatibility: "strict",
    headers: {
      "X-Title": "hackai-frontend",
    },
    ...options,
  });
}
