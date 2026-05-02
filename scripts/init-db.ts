import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.LIBSQL_TOKEN,
});

const initDb = async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS stock_quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        price REAL,
        change REAL,
        change_percent REAL,
        currency TEXT,
        market_time INTEGER,
        day_high REAL,
        day_low REAL,
        volume BLOB,
        market_cap BLOB,
        fetched_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )
    `;

    const result = await client.execute(sql);
    console.log("✅ Database initialized successfully!");
    console.log("Result:", result);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
};

initDb();
