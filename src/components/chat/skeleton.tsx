import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MessageRole = "assistant" | "user";

const messageSkeletons: MessageRole[] = [
  "assistant",
  "user",
  "assistant",
  "assistant",
  "user",
];

function MessageSkeleton({ role, dense }: { role: MessageRole; dense?: boolean }) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group flex w-full max-w-[80%] flex-col gap-2",
        isUser ? "is-user ml-auto justify-end" : "is-assistant",
      )}
    >
      <div
        className={cn(
          "is-user:dark flex w-fit flex-col gap-2 overflow-hidden text-sm",
          "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
        )}
      >
        <Skeleton className="h-4 w-60 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
        {!dense && <Skeleton className="h-4 w-40 rounded" />}
      </div>

      <div
        className={cn(
          "flex items-center gap-1",
          isUser && "justify-end",
          dense && "hidden md:flex",
        )}
      >
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        {!isUser && <Skeleton className="h-8 w-16 rounded-md" />}
      </div>

      {!isUser && !dense && (
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      )}

      {role === "assistant" && !dense && (
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl md:block" />
        </div>
      )}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex size-full flex-col divide-y overflow-hidden">
      <Conversation>
        <ConversationContent>
          <div className="flex flex-col gap-6">
            {messageSkeletons.map((role, index) => (
              <MessageSkeleton key={index} role={role} dense={index === 3} />
            ))}
          </div>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="grid shrink-0 gap-4 pt-4">
        <div className="flex flex-wrap gap-2 px-4">
          <Skeleton className="h-8 w-44 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>

        <div className="w-full px-4 pb-4">
          <Card className="border-none bg-muted/40 shadow-none">
            <CardContent className="space-y-4 p-2 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>

              <Separator />

              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-2xl" />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
