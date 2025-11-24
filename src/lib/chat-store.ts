"use client";

import Dexie, { Table } from "dexie";
import type { UIMessage } from "ai";

export type ChatRow = {
  id: string;
  lastModel: string;

  icon: string;
  title: string;

  // What the user has typed so far
  input: string;

  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
};

class ChatDB extends Dexie {
  chats!: Table<ChatRow, string>;

  constructor() {
    super("chat-db");
    this.version(1).stores({
      chats: "&id, updatedAt",
    });
  }
}

export const db = new ChatDB();
