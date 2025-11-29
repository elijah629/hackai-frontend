import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UsageCard({ name, value }: { name: string; value: number }) {
  const full = value.toLocaleString();
  const compact = Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);

  return (
    <Card className="@container w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          <span className="inline @[170px]:hidden">{compact}</span>
          <span className="hidden @[170px]:inline">{full}</span>
        </CardTitle>
        <CardDescription>{name}</CardDescription>
      </CardHeader>
    </Card>
  );
}
