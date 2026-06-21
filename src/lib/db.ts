import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../../lib/schema";
import * as relations from "../../lib/relations";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
  authToken: process.env.LIBSQL_TOKEN,
});

export const db = drizzle(client, {
  schema: {
    ...schema,
    ...relations
  }
});
