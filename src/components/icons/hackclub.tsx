import { cn } from "@/lib/utils";

export function Hackclub({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-sidebar-primary text-sidebar-primary-foreground flex size-6 text-md items-center justify-center rounded-md font-bold",
        className,
      )}
    >
      h
    </div>
  );
}
