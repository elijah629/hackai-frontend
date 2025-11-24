import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { ChatModelSelector } from "./chat-model-selector";
import { Model } from "@/lib/hackclub";
import { Suggestions, Suggestion } from "../ai-elements/suggestion";
import { ReactNode } from "react";
import { Loader } from "../ai-elements/loader";

const suggestions = [
  "What are the latest trends in AI?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "What is the difference between SQL and NoSQL?",
];

type ChatPromptProps = {
  text: string;
  setText: (value: string) => void;
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
  hasModalRequirements: boolean;
  status: "submitted" | "streaming" | "idle" | "error";
  attachmentsEnabled: boolean;
  footer?: ReactNode;
  showSuggestions: boolean;
};

export function ChatPrompt({
  text,
  setText,
  models,
  chefs,
  hasModels,
  hasCompatibleModels,
  promptPlaceholder,
  activeModelData,
  effectiveModel,
  modelSelectorOpen,
  setModelSelectorOpen,
  onModelSelect,
  onSubmit,
  onSuggestionClick,
  isSubmitDisabled,
  compatibilityByModel,
  hasModalRequirements,
  status,
  attachmentsEnabled,
  footer,
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
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              )}
              <ChatModelSelector
                activeModelData={activeModelData}
                chefs={chefs}
                compatibilityByModel={compatibilityByModel}
                effectiveModel={effectiveModel}
                hasModalRequirements={hasModalRequirements}
                hasModels={hasModels}
                modelSelectorOpen={modelSelectorOpen}
                models={models}
                onSelect={onModelSelect}
                setModelSelectorOpen={setModelSelectorOpen}
              />
            </PromptInputTools>
            <PromptInputSubmit
              disabled={isSubmitDisabled}
              className="rounded-full"
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
        {footer}
      </div>
    </div>
  );
}

type PromptSuggestionsProps = {
  shouldRender: boolean;
  onSuggestionClick: (suggestion: string) => void;
};

function PromptSuggestions({ shouldRender, onSuggestionClick }: PromptSuggestionsProps) {
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

export function ConversationLoader({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  return <Loader />;
}
