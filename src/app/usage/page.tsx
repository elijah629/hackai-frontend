import { Models, ModelsSkeleton } from "@/components/models";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Usage } from "@/components/usage";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function UsageModelPage() {
  return (
    <main>
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
          <Button variant="outline" asChild>
            <Link href="https://ai.hackclub.com/dashboard" target="_blank">
              <ExternalLink />
              Extended metrics
            </Link>
          </Button>
        </div>
        <Suspense fallback={<Skeleton className="rounded-xl py-6" />}>
          <Usage />
        </Suspense>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <div>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Models
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Full list of currently allowed completion models
          </p>
        </div>

        <div className="space-y-8">
          <Suspense fallback={<ModelsSkeleton />}>
            <Models />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
