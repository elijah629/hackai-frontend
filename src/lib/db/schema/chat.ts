import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  varchar,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { generateId, ProviderMetadata } from "ai";
import { generateChatId } from "@/lib/chat";
import { Message, MessageMetadata } from "@/types/message";

export const chats = pgTable(
  "chats",
  {
    id: varchar({ length: 32 })
      .primaryKey()
      .$defaultFn(() => generateChatId()),

    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    title: text("title").notNull().default("New Chat"),
    icon: text("icon").notNull().default("💬"),
    lastModel: text("last_model").notNull().default("google/gemini-2.5-flash"),

    isPublic: boolean("is_public").notNull().default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("chat_user_id_idx").on(table.userId)],
);

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    chatId: text("chat_id")
      .references(() => chats.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").$type<Message["role"]>().notNull(),
    metadata: jsonb().$type<MessageMetadata>(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("messages_chat_id_idx").on(table.chatId)],
);

export const parts = pgTable(
  "parts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    messageId: text("message_id")
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),
    order: integer().notNull().default(0),

    type: text("type").$type<Message["parts"][0]["type"]>().notNull(),

    text: text("text"), // for both text AND reasoning types

    // no tools, add if needed. see https://v6.ai-sdk.dev/docs/reference/ai-sdk-core/ui-message#tooluipart

    // source_url
    source_url_sourceId: varchar(),
    source_url_url: varchar(),
    source_url_title: varchar(), // optional

    source_document_sourceId: varchar(),
    source_document_mediaType: varchar(),
    source_document_title: varchar(),
    source_document_filename: varchar(), // optional

    file_mediaType: varchar(),
    file_filename: varchar(), // optional
    file_url: varchar(),

    // no data, add if needed. see https://v6.ai-sdk.dev/docs/reference/ai-sdk-core/ui-message#datauipart

    providerMetadata: jsonb().$type<ProviderMetadata>(),
  },
  (t) => [
    index("parts_message_id_idx").on(t.messageId),
    index("parts_message_id_order_idx").on(t.messageId, t.order),

    check(
      "text_required_if_type_is_text_or_reasoning",
      sql`CASE WHEN ${t.type} IN ('text', 'reasoning') THEN ${t.text} IS NOT NULL ELSE TRUE END`,
    ),
    check(
      "file_fields_required_if_type_is_file",
      sql`CASE WHEN ${t.type} = 'file' THEN ${t.file_mediaType} IS NOT NULL AND ${t.file_url} IS NOT NULL ELSE TRUE END`,
    ),
    check(
      "source_url_fields_required_if_type_is_source_url",
      sql`CASE WHEN ${t.type} = 'source_url' THEN ${t.source_url_sourceId} IS NOT NULL AND ${t.source_url_url} IS NOT NULL ELSE TRUE END`,
    ),
    check(
      "source_document_fields_required_if_type_is_source_document",
      sql`CASE WHEN ${t.type} = 'source_document' THEN ${t.source_document_sourceId} IS NOT NULL AND ${t.source_document_mediaType} IS NOT NULL AND ${t.source_document_title} IS NOT NULL ELSE TRUE END`,
    ),
  ],
);

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(user, {
    fields: [chats.userId],
    references: [user.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  parts: many(parts),
}));

export const partsRelations = relations(parts, ({ one }) => ({
  message: one(messages, {
    fields: [parts.messageId],
    references: [messages.id],
  }),
}));

export type Chat = typeof chats.$inferSelect & {
  messages: /*(typeof messages.$inferSelect & {
    parts: typeof parts.$inferSelect;
  })*/ Message[];
};
export type DBMessagePart = typeof parts.$inferInsert;
export type DBMessagePartSelect = typeof parts.$inferSelect;
