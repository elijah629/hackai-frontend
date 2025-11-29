import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  MessageAttachment,
  MessageAttachments,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  MessageAction,
  MessageActions,
} from "@/components/ai-elements/message";
import { CopyIcon, MessageSquare } from "lucide-react";
import { UIMessage } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import { streamdownConfig } from "@/lib/streamdown";

export function StaticChatMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <>
      {messages.length === 0 && (
        <ConversationEmptyState
          icon={<MessageSquare className="size-12" />}
          title="Empty conversation"
          description="This public chat is empty"
        />
      )}
      {messages.map((message) => {
        const sources = message.parts.filter(
          (part) => part.type === "source-url",
        );

        return (
          <div key={message.id}>
            {message.role === "assistant" && sources.length > 0 && (
              <Sources>
                <SourcesTrigger count={sources.length} />
                {sources.map((part, i) => (
                  <SourcesContent key={`${message.id}-${i}`}>
                    <Source
                      key={`${message.id}-${i}`}
                      href={part.url}
                      title={part.url}
                    />
                  </SourcesContent>
                ))}
              </Sources>
            )}

            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <Message
                      key={`${message.id}-${i}`}
                      from={message.role}
                      className="max-w-none"
                    >
                      <MessageContent className="max-w-full">
                        <MessageResponse {...streamdownConfig}>
                          {part.text}
                        </MessageResponse>
                      </MessageContent>
                      {message.role === "assistant" && (
                        <MessageActions>
                          <MessageAction
                            onClick={() =>
                              navigator.clipboard.writeText(part.text)
                            }
                            label="Copy"
                          >
                            <CopyIcon className="size-3" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </Message>
                  );
                case "reasoning":
                  const reasoning = part.text
                    .replaceAll("[REDACTED]", "")
                    .replaceAll("\\n", "\n")
                    .trim();

                  if (reasoning === "") {
                    return;
                  }

                  return (
                    <Reasoning
                      key={`${message.id}-${i}`}
                      className="w-full"
                      isStreaming={false}
                    >
                      <ReasoningTrigger />
                      <ReasoningContent className="text-muted-foreground ml-6">
                        {reasoning}
                      </ReasoningContent>
                    </Reasoning>
                  );

                default:
                  return;
              }
            })}
            <MessageAttachments
              className={cn(message.role === "assistant" && "ml-0", "mt-2")}
            >
              {message.parts
                .filter((part) => part.type === "file")
                .map((part) => (
                  <MessageAttachment
                    className={cn(
                      message.role === "assistant" &&
                        part.mediaType.startsWith("image/") &&
                        "size-32 md:size-64",
                    )}
                    data={part}
                    key={part.url}
                  />
                ))}
            </MessageAttachments>
          </div>
        );
      })}
    </>
  );
}
