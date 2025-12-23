import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as auth from "./schema/auth";
import * as chat from "./schema/chat";

const pool = new Pool({
  connectionString: process.env.POSTGRESQL_CONNECTION_STRING!,
  max: 200,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle(pool, {
  schema: {
    ...auth,
    ...chat,
  },
});
