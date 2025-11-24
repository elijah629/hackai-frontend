import { SessionOptions } from "iron-session";

export interface SessionData {
  apiKey?: string;
}

export const defaultSession: SessionData = {};

const cookieSecret = process.env.COOKIE_SECRET;

if (!cookieSecret) {
  throw new Error("Missing COOKIE_SECRET environment variable for sessions.");
}

export const sessionOptions: SessionOptions = {
  password: cookieSecret,
  cookieName: "hc-ai-api-key",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
