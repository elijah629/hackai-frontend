"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
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
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";

import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { CheckIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Model } from "@/lib/hackclub";
import { useChat } from "@ai-sdk/react";
import { Loader } from "./ai-elements/loader";
import { ChatRow, db } from "@/lib/chat-store";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChatMessages } from "./chat-messages";
import { Badge } from "./ui/badge";
import { getDisplayModelName } from "@/lib/utils";
import { nanoid } from "nanoid";

const suggestions = [
  "What are the latest trends in AI?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "What is the difference between SQL and NoSQL?",
];

const defaultModel = "google/gemini-2.5-flash";

export function Chat({ models, chatId }: { models: Model[]; chatId: string }) {
  const storedChat = useLiveQuery<ChatRow | undefined, null>(
    () => db.chats.get(chatId),
    [chatId],
    null,
  );

  if (storedChat === null) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <InnerChat models={models} chatId={chatId} storedChat={storedChat} />;
}

function InnerChat({
  models,
  chatId,
  storedChat,
}: {
  models: Model[];
  chatId: string;
  storedChat?: ChatRow;
}) {
  const router = useRouter();
  const [model, setModel] = useState<string>(
    storedChat?.lastModel ?? defaultModel,
  );
  const [text, setText] = useState(storedChat?.input ?? "");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  // Track if this chat has *ever* existed in Dexie
  const [hadStoredChat, setHadStoredChat] = useState(!!storedChat);

  useEffect(() => {
    if (storedChat) {
      setHadStoredChat(true);
    }
  }, [storedChat]);

  const { messages, sendMessage, status, regenerate, id } = useChat({
    id: chatId,
    messages: storedChat?.messages ?? [],
    onError: (e) => {
      console.error(e);
      toast.error(e.message);
    },
  });

  // Sync messages/model/etc. -> Dexie
  useEffect(() => {
    if (messages.length === 0) return;

    // If this chat used to exist but was deleted from Dexie,
    // don't recreate it just because messages are still in memory.
    if (!storedChat && hadStoredChat) {
      router.replace(`/c/${nanoid()}`);
      return;
    }

    const now = Date.now();

    const chatRow: ChatRow = {
      id,
      lastModel: model,
      messages,
      input: text,
      title: storedChat?.title ?? "New Chat",
      icon: storedChat?.icon ?? "💬",
      createdAt: storedChat?.createdAt ?? now,
      updatedAt:
        storedChat?.messages.length !== messages.length
          ? now
          : storedChat?.updatedAt,
    };

    db.chats.put(chatRow);
  }, [messages, text, id, model, storedChat, chatId, hadStoredChat, router]);

  // Title + emoji generation for *new* chats only
  useEffect(() => {
    if (messages.length !== 1) return;
    if (messages[0].role !== "user") return;
    if (storedChat?.title || storedChat?.icon) return;

    if (!storedChat && hadStoredChat) return;

    const now = Date.now();

    const chatRow: ChatRow = {
      id,
      lastModel: model,
      messages,
      input: text,
      title: storedChat?.title ?? "New Chat",
      icon: storedChat?.icon ?? "💬",
      createdAt: storedChat?.createdAt ?? now,
      updatedAt:
        storedChat?.messages.length !== messages.length
          ? now
          : storedChat?.updatedAt,
    };

    (async () => {
      const { title, emoji } = await fetch("/api/chat-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: messages[0].parts.find((x) => x.type === "text")!.text,
        }),
      }).then((x) => x.json());

      db.chats.put({ ...chatRow, title, icon: emoji });
    })();
  }, [messages, id, storedChat, chatId, hadStoredChat, model, text]);

  const chefs: string[] = useMemo(
    () => Array.from(new Set(models.map((x) => x.chef))).sort(),
    [models],
  );

  const selectedModelData = models.find((m) => m.id === model);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);

    if (!hasText && !hasAttachments) return;

    setText("");
    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model,
        },
      },
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion }, { body: { model } });
  };

  const isSubmitDisabled =
    !text.trim() || status === "streaming" || status === "submitted";
  return (
    <div className="flex size-full flex-col divide-y overflow-hidden">
      <Conversation>
        <ConversationContent>
          <ChatMessages
            messages={messages}
            status={status}
            regenerate={regenerate}
          />
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="grid shrink-0 gap-4 pt-4">
        {!messages.length && (
          <Suggestions className="px-4">
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}
        <div className="w-full px-4 pb-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader className="p-0">
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask anything"
                onChange={(event) => setText(event.target.value)}
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                {selectedModelData?.architecture.input_modalities.some(
                  (x) => x !== "text",
                ) && (
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                )}
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      {selectedModelData?.id.split("/")[0] && (
                        <ModelSelectorLogo
                          provider={selectedModelData.id.split("/")[0]}
                        />
                      )}
                      {selectedModelData?.name && (
                        <ModelSelectorName>
                          {selectedModelData.name}
                        </ModelSelectorName>
                      )}
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {chefs.map((chef) => (
                        <ModelSelectorGroup key={chef} heading={chef}>
                          {models
                            .filter((m) => m.chef === chef)
                            .map((m) => (
                              <ModelSelectorItem
                                key={m.id}
                                onSelect={() => {
                                  setModel(m.id);
                                  setModelSelectorOpen(false);
                                }}
                                value={m.id}
                              >
                                <ModelSelectorLogo provider={m.chefSlug} />
                                <ModelSelectorName>
                                  {getDisplayModelName(m.chef, m.name)}
                                </ModelSelectorName>
                                {model === m.id && (
                                  <CheckIcon className="ml-auto size-4" />
                                )}
                                <div className="flex flex-wrap items-center gap-2">
                                  {m.architecture.input_modalities
                                    .filter((x) => x !== "text")
                                    .map((modality) => (
                                      <Badge key={modality} variant="outline">
                                        {modality}
                                      </Badge>
                                    ))}
                                </div>
                              </ModelSelectorItem>
                            ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={isSubmitDisabled}
                className="rounded-full"
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
