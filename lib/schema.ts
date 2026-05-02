import { sqliteTable, integer, real, text, blob } from "drizzle-orm/sqlite-core";

export const stockQuotes = sqliteTable("stock_quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  price: real("price"),
  change: real("change"),
  changePercent: real("change_percent"),
  currency: text("currency"),
  marketTime: integer("market_time"),
  dayHigh: real("day_high"),
  dayLow: real("day_low"),
  volume: blob("volume"), // Using blob to store BigInt as serialized data
  marketCap: blob("market_cap"),
  fetchedAt: integer("fetched_at").notNull(), // Store as unix timestamp
  createdAt: integer("created_at").notNull(),
});
