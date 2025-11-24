import { SessionOptions } from "iron-session";

export interface SessionData {
  apiKey?: string;
}

export const defaultSession: SessionData = {};

export const sessionOptions: SessionOptions = {
  password: process.env.COOKIE_SECRET!,
  cookieName: "hc-ai-api-key",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
