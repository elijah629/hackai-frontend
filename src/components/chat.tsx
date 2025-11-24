"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useEffect, useMemo, useState } from "react";
import { Model } from "@/lib/hackclub";
import { useChat } from "@ai-sdk/react";
import { ChatRow, db } from "@/lib/chat-store";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChatMessages } from "./chat-messages";
import { nanoid } from "nanoid";
import {
  normalizeSubmissionModalities,
  useModelCompatibility,
  useRequiredModalities,
} from "./chat/use-chat-compatibility";
import { ChatPrompt, ConversationLoader } from "./chat/chat-prompt";
import { Loader } from "./ai-elements/loader";

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

  useEffect(() => {
    if (storedChat?.input && !text) {
      setText(storedChat.input);
    }
  }, [storedChat, text]);

  const { messages, sendMessage, setMessages, status, regenerate, id } = useChat({
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
      lastModel: effectiveModel ?? model,
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
  }, [
    messages,
    text,
    id,
    model,
    storedChat,
    chatId,
    hadStoredChat,
    router,
    effectiveModel,
  ]);

  // Title + emoji generation for *new* chats only
  useEffect(() => {
    if (messages.length !== 1) return;
    if (messages[0].role !== "user") return;
    if (storedChat?.title || storedChat?.icon) return;

    if (!storedChat && hadStoredChat) return;

    const now = Date.now();

    const chatRow: ChatRow = {
      id,
      lastModel: effectiveModel ?? model,
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
  }, [
    messages,
    id,
    storedChat,
    chatId,
    hadStoredChat,
    model,
    text,
    effectiveModel,
  ]);

  const chefs: string[] = useMemo(
    () => Array.from(new Set(models.map((x) => x.chef))).sort(),
    [models],
  );

  const { requiredInputModalities, hasModalRequirements } = useRequiredModalities(messages);

  const { compatibilityByModel, firstCompatibleModelId, hasModels, hasCompatibleModels } =
    useModelCompatibility(models, requiredInputModalities);

  const selectedModelData = models.find((m) => m.id === model);

  useEffect(() => {
    if (!models.length) return;

    if (!selectedModelData) {
      if (firstCompatibleModelId) {
        setModel(firstCompatibleModelId);
      } else if (models[0]) {
        setModel(models[0].id);
      }
    }
  }, [firstCompatibleModelId, models, selectedModelData]);

  const effectiveModel = selectedModelData?.id ?? firstCompatibleModelId;
  const activeModelData = models.find((m) => m.id === effectiveModel);
  const promptPlaceholder = effectiveModel
    ? "Ask anything"
    : hasModels
      ? "No compatible models for this conversation"
      : "Add a model to start chatting";

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);

    if (!hasText && !hasAttachments) return;

    if (!effectiveModel || !activeModelData) {
      toast.error("No available models right now. Try again later.");
      return;
    }

    const compatibility = compatibilityByModel.get(activeModelData.id);

    if (compatibility && compatibility.missingInputs.length > 0) {
      toast.error("Selected model cannot handle this conversation's requirements.");
      return;
    }

    const submissionInputRequirements = normalizeSubmissionModalities(message);

    const missingSubmissionInputs = Array.from(submissionInputRequirements).filter(
      (requirement) =>
        !(activeModelData.architecture?.input_modalities ?? []).includes(requirement),
    );

    if (missingSubmissionInputs.length > 0) {
      toast.error(
        `Selected model can't process ${missingSubmissionInputs.join(", ")} input for this message.`,
      );
      return;
    }

    setText("");
    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: effectiveModel,
        },
      },
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!effectiveModel) {
      toast.error("No available models right now. Try again later.");
      return;
    }

    sendMessage({ text: suggestion }, { body: { model: effectiveModel } });
  };

  const handleDeleteFromMessage = (messageId: string) => {
    const index = messages.findIndex((message) => message.id === messageId);
    if (index === -1) return;

    setMessages(messages.slice(0, index));
  };

  const isSubmitDisabled =
    !effectiveModel ||
    !hasCompatibleModels ||
    !text.trim() ||
    status === "streaming" ||
    status === "submitted";

  const attachmentsEnabled =
    activeModelData?.architecture?.input_modalities?.some((x) => x !== "text") ??
    false;

  const showSuggestions = messages.length === 0 && text.length === 0;
  return (
    <div className="flex size-full flex-col divide-y overflow-hidden">
      <Conversation>
        <ConversationContent>
          <ChatMessages
            messages={messages}
            status={status}
            regenerate={regenerate}
            onDeleteMessage={handleDeleteFromMessage}
          />
          <ConversationLoader isVisible={status === "submitted"} />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <ChatPrompt
        activeModelData={activeModelData}
        attachmentsEnabled={attachmentsEnabled}
        chefs={chefs}
        compatibilityByModel={compatibilityByModel}
        effectiveModel={effectiveModel}
        hasCompatibleModels={hasCompatibleModels}
        hasModalRequirements={hasModalRequirements}
        hasModels={hasModels}
        isSubmitDisabled={isSubmitDisabled}
        modelSelectorOpen={modelSelectorOpen}
        models={models}
        onModelSelect={setModel}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
        promptPlaceholder={promptPlaceholder}
        setModelSelectorOpen={setModelSelectorOpen}
        status={status}
        text={text}
        setText={setText}
        showSuggestions={showSuggestions}
      />
    </div>
  );
}
