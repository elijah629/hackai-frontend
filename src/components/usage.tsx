import { getUsageMetrics, UsageMetrics } from "@/lib/hackclub";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { UsageCard } from "@/components/usage-card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function Usage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let usageMetrics: UsageMetrics | null = null;

  let message = "You must be logged in to view usage metrics.";

  if (session?.user?.apiKey) {
    try {
      usageMetrics = await getUsageMetrics(session.user.apiKey);
    } catch (e: any) {
      message = e.message;
    }
  }

  return usageMetrics ? (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <CardTitle>Usage summary</CardTitle>
        <Badge variant="secondary">All API keys</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* backwards? the api is odd and fliped them */}
        <UsageCard
          name={"Output Tokens"}
          value={usageMetrics.totalCompletionTokens}
        />
        <UsageCard
          name={"Input Tokens"}
          value={usageMetrics.totalPromptTokens}
        />
        <UsageCard name={"Total Tokens"} value={usageMetrics.totalTokens} />
        <UsageCard name={"Requests"} value={usageMetrics.totalRequests} />
      </CardContent>
      <CardFooter className="text-xs leading-relaxed text-muted-foreground">
        Token counts are based on requests made with every API key. For more in
        depth request metrics, open the extended metrics dashboard.
      </CardFooter>
    </Card>
  ) : (
    <Card className="items-center justify-center">
      <p>{message}</p>
    </Card>
  );
}
