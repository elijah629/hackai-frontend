import { cn } from "@/lib/utils";

export function Hackclub({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[#ec3750] text-white flex size-6 text-md items-center justify-center rounded-md font-bold",
        className,
      )}
    >
      h
    </div>
  );
}
