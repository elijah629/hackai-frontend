"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message } from "@/types/message";
import { StaticChatMessages } from "./static-messages";

export function StaticChat({ messages }: { messages: Message[] }) {
  return (
    <div className="flex size-full flex-col divide-y overflow-hidden">
      <Conversation>
        <ConversationContent>
          <StaticChatMessages messages={messages} />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
