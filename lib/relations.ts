import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

// Relations for portfolios
export const portfolioRelations = relations(schema.portfolios, ({ many }) => ({
  positions: many(schema.positions),
}));

// Relations for positions
export const positionRelations = relations(schema.positions, ({ one }) => ({
  portfolio: one(schema.portfolios, {
    fields: [schema.positions.portfolioId],
    references: [schema.portfolios.id],
  }),
}));

// Relations for watchlists
export const watchlistRelations = relations(schema.watchlists, ({ many }) => ({
  assets: many(schema.watchlistAssets),
}));

// Relations for watchlist assets
export const watchlistAssetRelations = relations(schema.watchlistAssets, ({ one }) => ({
  watchlist: one(schema.watchlists, {
    fields: [schema.watchlistAssets.watchlistId],
    references: [schema.watchlists.id],
  }),
}));

// Relations for users
export const userRelations = relations(schema.users, ({ many }) => ({
  portfolios: many(schema.portfolios),
  watchlists: many(schema.watchlists),
  chartAnnotations: many(schema.chartAnnotations),
}));