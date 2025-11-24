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
import { CopyIcon, MessageSquare, RefreshCcwIcon } from "lucide-react";
import { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import { cn, shikiThemes } from "@/lib/utils";
import { ConversationEmptyState } from "./ai-elements/conversation";

export function ChatMessages({
  messages,
  regenerate,
  status,
}: {
  messages: UIMessage[];
  regenerate: UseChatHelpers<UIMessage>["regenerate"];
  status: UseChatHelpers<UIMessage>["status"];
}) {
  return (
    <>
      {messages.length === 0 && (
        <ConversationEmptyState
          icon={<MessageSquare className="size-12" />}
          title="Start a conversation"
          description="Type a message below to begin chatting"
        />
      )}
      {messages.map((message, messageIndex) => (
        <div key={message.id}>
          {message.role === "assistant" &&
            message.parts.filter((part) => part.type === "source-url").length >
              0 && (
              <Sources>
                <SourcesTrigger
                  count={
                    message.parts.filter((part) => part.type === "source-url")
                      .length
                  }
                />
                {message.parts
                  .filter((part) => part.type === "source-url")
                  .map((part, i) => (
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
                    className="max-w-none "
                  >
                    <MessageContent>
                      <MessageResponse shikiTheme={shikiThemes}>
                        {part.text}
                      </MessageResponse>
                    </MessageContent>
                    {message.role === "assistant" && (
                      <MessageActions>
                        {messageIndex === messages.length - 1 && (
                          <MessageAction
                            onClick={() => regenerate()}
                            label="Retry"
                          >
                            <RefreshCcwIcon className="size-3" />
                          </MessageAction>
                        )}
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
                if (part.text === "[REDACTED]") {
                  return;
                }

                return (
                  <Reasoning
                    key={`${message.id}-${i}`}
                    className="w-full"
                    isStreaming={
                      status === "streaming" &&
                      i === message.parts.length - 1 &&
                      message.id === messages.at(-1)?.id
                    }
                  >
                    <ReasoningTrigger />
                    <ReasoningContent>{part.text}</ReasoningContent>
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
      ))}
    </>
  );
}
