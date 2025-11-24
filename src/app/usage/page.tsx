import { getSession } from "../actions";
import { getModelList, getUsageMetrics, UsageMetrics } from "@/lib/hackclub";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { UsageCard } from "@/components/usage-card";
import { ModelSelectorLogo } from "@/components/ai-elements/model-selector";
import { MessageResponse } from "@/components/ai-elements/message";
import { getDisplayModelName } from "@/lib/utils";

const contextFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
});

export default async function Usage() {
  const models = await getModelList();
  const chefs: string[] = Array.from(new Set(models.map((x) => x.chef))).sort();
  const session = await getSession();
  let usageMetrics: UsageMetrics | null = null;
  const loggedIn = session.apiKey !== undefined;
  if (session.apiKey !== undefined) {
    usageMetrics = await getUsageMetrics(session.apiKey);
  }
  const metrics = usageMetrics
    ? [
        { name: "Input Tokens", value: usageMetrics.totalPromptTokens },
        { name: "Output Tokens", value: usageMetrics.totalCompletionTokens },
        { name: "Total Tokens", value: usageMetrics.totalTokens },
        { name: "Requests", value: usageMetrics.totalRequests },
      ]
    : [];
  return (
    <section>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
              Usage
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              A quick overview of how your hackai account has been used across
              all requests, tokens, and API keys.
            </p>
          </div>
        </div>
        {!loggedIn && (
          <Card className="items-center justify-center">
            <p>You must be logged in to view usage metrics.</p>
          </Card>
        )}
        {loggedIn && (
          <Card>
            <CardHeader className="flex items-center justify-between gap-4">
              <CardTitle>Usage summary</CardTitle>
              <Badge variant="secondary">All API keys</Badge>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(({ name, value }) => (
                <UsageCard key={name} name={name} value={value} />
              ))}
            </CardContent>
            <CardFooter className="text-xs leading-relaxed text-muted-foreground">
              Token counts are based on requests made with every API key. For
              more in depth request metrics, open the extended metrics
              dashboard.
            </CardFooter>
          </Card>
        )}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
              Models
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Full list of currently allowed completion models
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {chefs.map((chef) => (
            <section key={chef} className="space-y-4">
              <header className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                  {chef}
                </h2>
              </header>

              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {models
                  .filter((m) => m.chef === chef)
                  .map((m) => (
                    <Card key={m.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold  leading-tight">
                          <ModelSelectorLogo
                            className="size-6"
                            provider={m.chefSlug}
                          />
                          {getDisplayModelName(m.chef, m.name)}
                        </CardTitle>
                        <Badge variant="secondary" className="ml-8">
                          {contextFormatter.format(m.context_length)} context
                          window
                        </Badge>
                      </CardHeader>

                      <CardContent className="ml-8">
                        <MessageResponse className="text-xs leading-snug text-muted-foreground">
                          {m.description.replaceAll("\\n", "\n")}
                        </MessageResponse>
                      </CardContent>
                      <CardFooter className="flex-col items-start ml-8 text-xs text-muted-foreground gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">Input:</span>
                          {m.architecture.input_modalities.map((modality) => (
                            <Badge key={modality} variant="outline">
                              {modality}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">Output:</span>
                          {m.architecture.output_modalities.map((modality) => (
                            <Badge key={modality} variant="outline">
                              {modality}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold">Model ID:</span>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                            {m.id}
                          </code>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
