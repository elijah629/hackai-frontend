import { getModelList } from "@/lib/hackclub";
import { ModelSelectorLogo } from "@/components/ai-elements/model-selector";
import { getDisplayModelName } from "@/lib/utils";
import { ModelMarkdown } from "@/components/model-markdown";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";

const contextFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
});

export async function Models() {
  const models = await getModelList();
  const chefs: string[] = Array.from(new Set(models.map((x) => x.chef))).sort();

  return chefs.map((chef) => (
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
                  <ModelSelectorLogo className="size-6" provider={m.chefSlug} />
                  {getDisplayModelName(m.chef, m.name)}
                </CardTitle>
                <Badge variant="secondary" className="ml-8">
                  {contextFormatter.format(m.context_length)} context window
                </Badge>
              </CardHeader>

              <CardContent className="ml-8">
                <ModelMarkdown>
                  {m.description.replaceAll("\\n", "\n")}
                </ModelMarkdown>
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
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                    {m.id}
                  </code>
                </div>
              </CardFooter>
            </Card>
          ))}
      </div>
    </section>
  ));
}

export function ModelsSkeleton() {
  const fakeChefs = Array.from({ length: 2 });
  const fakeCards = Array.from({ length: 3 });

  return (
    <div className="space-y-8">
      {fakeChefs.map((_, chefIndex) => (
        <section key={chefIndex} className="space-y-4">
          <header className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-32" />
          </header>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {fakeCards.map((_, cardIndex) => (
              <Card key={cardIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold leading-tight">
                    {/* Logo circle */}
                    <Skeleton className="h-6 w-6 rounded-full" />
                    {/* Model name */}
                    <Skeleton className="h-4 w-40" />
                  </CardTitle>
                  <div className="ml-8 mt-2 inline-flex items-center">
                    <Skeleton className="h-5 w-40 rounded-full" />
                  </div>
                </CardHeader>

                <CardContent className="ml-8 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>

                <CardFooter className="ml-8 flex-col items-start gap-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-5 w-32 rounded-md" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
