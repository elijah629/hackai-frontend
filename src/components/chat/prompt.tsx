import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Model } from "@/lib/hackclub";
import { Suggestions, Suggestion } from "../ai-elements/suggestion";
import { UseChatHelpers } from "@ai-sdk/react";
import { GlobeIcon } from "lucide-react";
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
import {
  Message,
  MessageMetadata,
  MessageUsageMetadata,
} from "@/types/message";
import Link from "next/link";

const suggestions = [
  "What are the latest trends in AI?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "What is the difference between SQL and NoSQL?",
];

export function ChatPrompt({
  text,
  setText,

  stop,

  modelData,

  promptPlaceholder,

  useWebSearch,
  setUseWebSearch,

  onSubmit,
  onSuggestionClick,

  isSubmitDisabled,

  status,

  attachmentsEnabled,
  showSuggestions,

  usageData,
}: {
  text: string;
  setText: (text: string) => void;

  stop: () => void;

  modelData: Model;

  promptPlaceholder: string;

  useWebSearch: boolean;
  setUseWebSearch: (useWebSearch: boolean) => void;

  onSubmit: (message: PromptInputMessage) => void;
  onSuggestionClick: (suggestion: string) => void;

  isSubmitDisabled: boolean;

  status: UseChatHelpers<Message>["status"];

  attachmentsEnabled: boolean;
  showSuggestions: boolean;

  usageData: MessageUsageMetadata;
}) {
  return (
    <div className="grid shrink-0 gap-4 pt-4">
      <PromptSuggestions
        onSuggestionClick={onSuggestionClick}
        shouldRender={showSuggestions}
      />
      <div className="w-full px-4">
        <PromptInput globalDrop multiple onSubmit={onSubmit}>
          <PromptInputHeader className="p-0">
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={promptPlaceholder}
              onChange={(event) => setText(event.target.value)}
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              {attachmentsEnabled && (
                <>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                </>
              )}
              <PromptInputButton
                className="sm:hidden"
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? "default" : "ghost"}
                size="icon-sm"
              >
                <GlobeIcon size={16} />
              </PromptInputButton>
              <PromptInputButton
                className="sm:inline-flex hidden"
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? "default" : "ghost"}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>

              <Context maxTokens={modelData.context_length} usage={usageData}>
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
            </PromptInputTools>
            <PromptInputSubmit
              disabled={isSubmitDisabled}
              onClick={(e) => {
                if (status === "streaming") {
                  e.preventDefault();
                  stop();
                }
              }}
              className="rounded-full"
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
      <span className="w-full text-sm text-center pb-2 -mt-1">
        Messages may be monitored. Review our{" "}
        <Link
          className="text-primary underline"
          target="_blank"
          href="/privacy"
        >
          Privacy Policy
        </Link>
      </span>
    </div>
  );
}

type PromptSuggestionsProps = {
  shouldRender: boolean;
  onSuggestionClick: (suggestion: string) => void;
};

function PromptSuggestions({
  shouldRender,
  onSuggestionClick,
}: PromptSuggestionsProps) {
  if (!shouldRender) return null;

  return (
    <Suggestions className="px-4">
      {suggestions.map((suggestion) => (
        <Suggestion
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          suggestion={suggestion}
        />
      ))}
    </Suggestions>
  );
}
