// So we can extend with tools easier, later
//
import { Message } from "@/components/ai-elements/message";
import { UIMessage } from "ai";
import { DBMessagePart, DBMessagePartSelect } from "@/lib/db/schema/chat";
import z from "zod";

export const metadataSchema = z.object({
  usage: z
    .object({
      promptTokens: z.number(),
      promptTokensDetails: z.object({
        cachedTokens: z.number(),
      }),
      completionTokens: z.number(),
      completionTokensDetails: z.object({
        reasoningTokens: z.number(),
      }),
      cost: z.number(),
      totalTokens: z.number(),
    })
    .optional(),
});

export type MessageMetadata = z.infer<typeof metadataSchema>;

type DataPart = {};
type Tools = {};

export type Message = UIMessage<MessageMetadata, DataPart, Tools>;
export type MessagePart = Message["parts"][0];

export const mapUIMessagePartsToDBParts = (
  messageParts: MessagePart[],
  messageId: string,
): DBMessagePart[] => {
  return messageParts.map((part, index) => {
    switch (part.type) {
      case "text":
      case "reasoning":
        return {
          messageId,
          order: index,
          type: part.type,
          text: part.text,
          providerMetadata: part.providerMetadata,
        };
      case "file":
        return {
          messageId,
          order: index,
          type: part.type,
          file_mediaType: part.mediaType,
          file_filename: part.filename,
          file_url: part.url,
        };
      case "source-document":
        return {
          messageId,
          order: index,
          type: part.type,
          source_document_sourceId: part.sourceId,
          source_document_mediaType: part.mediaType,
          source_document_title: part.title,
          source_document_filename: part.filename,
          providerMetadata: part.providerMetadata,
        };
      case "source-url":
        return {
          messageId,
          order: index,
          type: part.type,
          source_url_sourceId: part.sourceId,
          source_url_url: part.url,
          source_url_title: part.title,
          providerMetadata: part.providerMetadata,
        };
      case "step-start":
        return {
          messageId,
          order: index,
          type: part.type,
        };
      default:
        throw new Error(`Unsupported part type: ${part}`);
    }
  });
};

export const mapDBPartToUIMessagePart = (
  part: DBMessagePartSelect,
): MessagePart => {
  switch (part.type) {
    case "text":
    case "reasoning":
      return {
        type: part.type,
        text: part.text!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "file":
      return {
        type: part.type,
        mediaType: part.file_mediaType!,
        filename: part.file_filename!,
        url: part.file_url!,
      };
    case "source-document":
      return {
        type: part.type,
        sourceId: part.source_document_sourceId!,
        mediaType: part.source_document_mediaType!,
        title: part.source_document_title!,
        filename: part.source_document_filename!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "source-url":
      return {
        type: part.type,
        sourceId: part.source_url_sourceId!,
        url: part.source_url_url!,
        title: part.source_url_title!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "step-start":
      return {
        type: part.type,
      };
    default:
      throw new Error(`Unsupported part type: ${part.type}`);
  }
};

export const totalUsage = (messages: Message[]) =>
  messages.reduce<NonNullable<MessageMetadata["usage"]>>(
    (total, message) => {
      const usage = message.metadata?.usage;

      if (!usage) {
        return total;
      }

      return {
        promptTokens: (total?.promptTokens ?? 0) + (usage.promptTokens ?? 0),

        promptTokensDetails: {
          cachedTokens:
            (total?.promptTokensDetails?.cachedTokens ?? 0) +
            (usage.promptTokensDetails?.cachedTokens ?? 0),
        },

        completionTokens:
          (total?.completionTokens ?? 0) + (usage.completionTokens ?? 0),

        completionTokensDetails: {
          reasoningTokens:
            (total?.completionTokensDetails?.reasoningTokens ?? 0) +
            (usage.completionTokensDetails?.reasoningTokens ?? 0),
        },

        cost: (total?.cost ?? 0) + (usage.cost ?? 0),

        totalTokens: (total?.totalTokens ?? 0) + (usage.totalTokens ?? 0),
      };
    },
    {
      promptTokens: 0,
      promptTokensDetails: { cachedTokens: 0 },
      completionTokens: 0,
      completionTokensDetails: { reasoningTokens: 0 },
      cost: 0,
      totalTokens: 0,
    },
  );
