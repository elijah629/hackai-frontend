import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, totalUsage } from "@/types/message";
import { StaticChatMessages } from "./static-messages";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@/components/ai-elements/context";
import { Model } from "@/lib/hackclub";

export function StaticChat({
  messages,
  title,
  icon,
  lastModel,
}: {
  messages: Message[];
  title: string;
  icon: string;
  lastModel?: Model;
}) {
  const usage = totalUsage(messages);

  return (
    <div className="flex size-full flex-col divide-y overflow-hidden">
      <header className="border-t bg-secondary items-center p-2 flex flex-col sm:flex-row justify-between">
        <h1 className="text-lg font-bold">
          {icon} {title}
        </h1>
        {lastModel && (
          <div>
            <span className="font-mono text-xs">{lastModel.id}</span>
            <Context usage={usage} maxTokens={lastModel.context_length}>
              <ContextTrigger />
              <ContextContent>
                <ContextContentHeader />
                <ContextContentBody>
                  <ContextInputUsage />
                  <ContextOutputUsage />
                  <ContextReasoningUsage />
                  <ContextCacheUsage />
                </ContextContentBody>
                <ContextContentFooter />
              </ContextContent>
            </Context>
          </div>
        )}
      </header>
      <Conversation>
        <ConversationContent>
          <StaticChatMessages messages={messages} />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
