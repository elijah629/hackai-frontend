"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { type PromptInputMessage } from "@/components/ai-elements/prompt-input";

import { Loader } from "@/components/ai-elements/loader";
import { useMemo, useState } from "react";
import { Model } from "@/lib/hackclub";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { ChatMessages } from "@/components/chat/messages";

import { ChatPrompt } from "./prompt";
import { Message } from "@/types/message";
import { DefaultChatTransport } from "ai";
import { deleteMessage, renameChat } from "@/lib/db/actions";

export function Chat({
  models,
  id,
  initialMessages,
  initialModel,
}: {
  models: Model[];
  id: string;
  initialModel: string;
  initialMessages: Message[];
}) {
  const [model, setModel] = useState<string>(initialModel);
  const [text, setText] = useState("");

  const [webSearch, setWebSearch] = useState(false);

  const { messages, sendMessage, status, regenerate, setMessages, stop } =
    useChat<Message>({
      id,
      messages: initialMessages,
      onError: (e) => {
        console.error(e);
        toast.error(e.message);
      },
      transport: new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => {
          const lastMessage = messages.at(-1);
          return {
            body: {
              id,
              message: lastMessage,
              model,
              webSearch,
              ...body,
            },
          };
        },
      }),
    });

  const modelData = useMemo(
    () => models.find((m) => m.id === model)!,
    [models, model],
  );

  const promptPlaceholder = "Ask anything";

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);

    if (!hasText && !hasAttachments) return;

    setText("");
    if (messages.length === 0) {
      (async () => {
        const { title, emoji } = await fetch("/api/chat-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: message.text,
          }),
        }).then((x) => x.json());

        await renameChat(id, emoji, title);
      })();
    }

    sendMessage({
      text: message.text || "Sent with attachments",
      files: message.files,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  const handleDeleteFromMessage = async (messageId: string) => {
    const index = messages.findIndex((message) => message.id === messageId);
    if (index === -1) return;
    setMessages(messages.slice(0, index));

    await deleteMessage(id, messageId);
  };

  const isSubmitDisabled =
    (status !== "streaming" && !text.trim()) || status === "submitted";

  const attachmentsEnabled =
    modelData.architecture?.input_modalities?.some((x) => x !== "text") ??
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
          {status === "submitted" && (
            <div>
              <Loader />
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <ChatPrompt
        // Models
        models={models}
        onModelSelect={setModel}
        modelData={modelData}
        // useChat
        stop={stop}
        status={status}
        // Web search
        useWebSearch={webSearch}
        setUseWebSearch={setWebSearch}
        // Attachments
        attachmentsEnabled={attachmentsEnabled}
        // Prompt
        text={text}
        setText={setText}
        promptPlaceholder={promptPlaceholder}
        // Submit
        isSubmitDisabled={isSubmitDisabled}
        onSubmit={handleSubmit}
        // Suggestions
        showSuggestions={showSuggestions}
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}
