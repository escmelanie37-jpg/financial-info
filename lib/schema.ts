import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Stock quotes table (real-time & cached)
export const stockQuotes = sqliteTable("stock_quotes", {
  symbol: text("symbol").primaryKey(),
  price: real("price"),
  change: real("change"),
  changePercent: real("change_percent"),
  dayHigh: real("day_high"),
  dayLow: real("day_low"),
  volume: real("volume"),
  marketCap: real("market_cap"),
  currency: text("currency"),
  marketTime: integer("market_time"),
  fetchedAt: integer("fetched_at"),
});

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: integer("created_at").notNull(),
});

// Portfolios table
export const portfolios = sqliteTable("portfolios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Positions table
export const positions = sqliteTable("positions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  portfolioId: integer("portfolio_id").notNull().references(() => portfolios.id),
  symbol: text("symbol").notNull(),
  quantity: real("quantity").notNull(),
  averagePrice: real("average_price").notNull(),
  purchaseDate: integer("purchase_date").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Watchlists table
export const watchlists = sqliteTable("watchlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Watchlist assets table
export const watchlistAssets = sqliteTable("watchlist_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  watchlistId: integer("watchlist_id").notNull().references(() => watchlists.id),
  symbol: text("symbol").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Chart annotations table
export const chartAnnotations = sqliteTable("chart_annotations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  title: text("title").notNull(),
  note: text("note"),
  date: integer("date").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Relations for portfolios
export const portfolioRelations = relations(portfolios, ({ many }) => ({
  positions: many(positions),
}));

// Relations for positions
export const positionRelations = relations(positions, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [positions.portfolioId],
    references: [portfolios.id],
  }),
}));

// Relations for watchlists
export const watchlistRelations = relations(watchlists, ({ many }) => ({
  assets: many(watchlistAssets),
}));

// Relations for watchlist assets
export const watchlistAssetRelations = relations(watchlistAssets, ({ one }) => ({
  watchlist: one(watchlists, {
    fields: [watchlistAssets.watchlistId],
    references: [watchlists.id],
  }),
}));

// Relations for users
export const userRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  watchlists: many(watchlists),
  chartAnnotations: many(chartAnnotations),
}));
