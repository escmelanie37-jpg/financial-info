import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";

// Conexión a la base de datos
const client = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
  authToken: process.env.LIBSQL_TOKEN,
});

async function initDatabase() {
  try {
    console.log("Starting database initialization...");
    
    // Primero, intentamos crear la base de datos si no existe
    await client.execute("CREATE TABLE IF NOT EXISTS dummy (id INTEGER PRIMARY KEY)");
    
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

initDatabase();