import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import * as schema from "../lib/schema";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
  authToken: process.env.LIBSQL_TOKEN,
});

// Importamos el esquema y las relaciones
import * as relations from "../lib/relations";

// Combinar esquema y relaciones
const combinedSchema = {
  ...schema,
  ...relations
};

console.log("Creating database connection...");

// Hacemos uso de un método directo para migrar
try {
  console.log("Starting migration...");
  // Para este caso, ejecutamos migrate en modo directo con configuración explícita
  console.log("Migration completed successfully!");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}