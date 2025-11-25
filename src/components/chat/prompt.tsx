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
import { ChatModelSelector } from "./model-selector";
import { Model } from "@/lib/hackclub";
import { Suggestions, Suggestion } from "../ai-elements/suggestion";
import { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import { GlobeIcon } from "lucide-react";
import { Separator } from "../ui/separator";

const suggestions = [
  "What are the latest trends in AI?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "What is the difference between SQL and NoSQL?",
];

type ChatPromptProps = {
  text: string;
  setText: (text: string) => void;
  models: Model[];
  chefs: string[];
  hasModels: boolean;
  hasCompatibleModels: boolean;
  promptPlaceholder: string;
  activeModelData?: Model;
  effectiveModel?: string;
  modelSelectorOpen: boolean;
  setModelSelectorOpen: (open: boolean) => void;
  onModelSelect: (modelId: string) => void;
  onSubmit: (message: PromptInputMessage) => void;
  onSuggestionClick: (suggestion: string) => void;
  isSubmitDisabled: boolean;
  compatibilityByModel: Map<string, { missingInputs: string[] }>;
  status: UseChatHelpers<UIMessage>["status"];
  useWebSearch: boolean;
  setUseWebSearch: (useWebSearch: boolean) => void;
  attachmentsEnabled: boolean;
  showSuggestions: boolean;
  stop: () => void;
};

export function ChatPrompt({
  text,
  setText,

  stop,

  models,
  chefs,
  hasModels,
  hasCompatibleModels,

  activeModelData,
  effectiveModel,

  promptPlaceholder,

  modelSelectorOpen,
  useWebSearch,

  setModelSelectorOpen,
  setUseWebSearch,

  onModelSelect,
  onSubmit,
  onSuggestionClick,

  isSubmitDisabled,

  compatibilityByModel,

  status,

  attachmentsEnabled,
  showSuggestions,
}: ChatPromptProps) {
  return (
    <div className="grid shrink-0 gap-4 pt-4">
      <PromptSuggestions
        onSuggestionClick={onSuggestionClick}
        shouldRender={showSuggestions}
      />
      {!hasModels && (
        <p className="px-4 text-sm text-muted-foreground">
          No models available. Add one to start chatting.
        </p>
      )}
      {!hasCompatibleModels && hasModels && (
        <p className="px-4 text-sm text-muted-foreground">
          No compatible models for the current conversation. Remove unsupported
          inputs or start a new chat.
        </p>
      )}
      <div className="w-full px-4 pb-4">
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
              disabled={!hasCompatibleModels}
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
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? "default" : "ghost"}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <ChatModelSelector
                activeModelData={activeModelData}
                chefs={chefs}
                compatibilityByModel={compatibilityByModel}
                effectiveModel={effectiveModel}
                hasModels={hasModels}
                modelSelectorOpen={modelSelectorOpen}
                models={models}
                onSelect={onModelSelect}
                setModelSelectorOpen={setModelSelectorOpen}
              />
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
