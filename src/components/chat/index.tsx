"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { type PromptInputMessage } from "@/components/ai-elements/prompt-input";

import { useMemo, useState } from "react";
import { Model } from "@/lib/hackclub";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { ChatMessages } from "@/components/chat/messages";

import { ChatPrompt } from "./prompt";
import { Message, totalUsage } from "@/types/message";
import { DefaultChatTransport } from "ai";
import { deleteMessage, renameChat } from "@/lib/db/actions";
import { ChatModelSelector } from "./model-selector";
import { Spinner } from "../ui/spinner";
import { ModelParameterModal } from "../model-parameter-modal";
import { ModelParameters } from "@/types/model-parameters";

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
  const [parameters, setParameters] = useState<ModelParameters>({
    temperature: 0.3,
  });

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
          // NOTE: cannot use state here as all outer variables are frozen on first render

          const lastMessage = messages.at(-1);
          return {
            body: {
              id,
              message: lastMessage,
              ...body,
            },
          };
        },
      }),
    });

  // TODO: make this a running total so we dont re-add previous messages every update
  const usageData = useMemo(() => {
    return totalUsage(messages);
  }, [messages]);

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

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model,
          webSearch,
          parameters,
        },
      },
    );
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
      <header className="p-2 flex justify-between">
        <ChatModelSelector
          modelData={modelData}
          models={models}
          onSelect={setModel}
        />
        <ModelParameterModal
          parameters={parameters}
          onChangeParameters={setParameters}
        />
      </header>
      <Conversation>
        <ConversationContent>
          <ChatMessages
            messages={messages}
            status={status}
            regenerate={() =>
              regenerate({
                body: { regenerate: true, model, webSearch, parameters },
              })
            }
            onDeleteMessage={handleDeleteFromMessage}
          />
          {status === "submitted" && (
            <div>
              <Spinner />
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <ChatPrompt
        usageData={usageData}
        // Models
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
