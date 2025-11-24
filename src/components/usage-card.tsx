import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UsageCard({ name, value }: { name: string; value: number }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          {value.toLocaleString()}
        </CardTitle>
        <CardDescription>{name}</CardDescription>
      </CardHeader>
    </Card>
  );
}
