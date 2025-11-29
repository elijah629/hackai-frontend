import { betterAuth } from "better-auth/minimal";
import { genericOAuth } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  telemetry: {
    enabled: false,
    debug: false,
  },
  appName: "HackAI Frontend",
  advanced: {
    cookiePrefix: "hackai",
  },
  experimental: {
    joins: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "hackclub",
          clientId: process.env.HACKCLUB_CLIENT_ID as string,
          clientSecret: process.env.HACKCLUB_CLIENT_SECRET as string,
          authorizationUrl: "https://account.hackclub.com/oauth/authorize",
          tokenUrl: "https://account.hackclub.com/oauth/token",
          async getUserInfo(tokens) {
            const {
              identity: { id, primary_email, first_name, last_name },
            } = await fetch("https://account.hackclub.com/api/v1/me", {
              headers: {
                Authorization: "Bearer " + tokens.accessToken,
              },
            }).then((x) => x.json());

            return {
              id,
              email: primary_email,
              name: first_name + " " + last_name,
              emailVerified: true, // HC requires it
            };
          },
          scopes: ["name", "email"],
        },
      ],
    }),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      apiKey: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
