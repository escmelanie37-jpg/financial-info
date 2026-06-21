import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import * as relations from "./relations";

console.log("DEBUG - TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL);
console.log("DEBUG - TURSO_AUTH_TOKEN length:", process.env.TURSO_AUTH_TOKEN?.length);

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { 
  schema: {
    ...schema,
    ...relations
  } 
});
