import type { Config } from "drizzle-kit";

const databaseUrl = process.env.TURSO_DATABASE_URL?.trim();
const isLocalFileDb = !databaseUrl || databaseUrl.startsWith("file:");

export default {
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: isLocalFileDb ? "sqlite" : "turso",
  dbCredentials: isLocalFileDb
    ? { url: databaseUrl || "file:./dev.db" }
    : {
        url: databaseUrl!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
} satisfies Config;
