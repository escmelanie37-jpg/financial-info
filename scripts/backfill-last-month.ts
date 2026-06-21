import "dotenv/config";
import YahooFinance from "yahoo-finance2";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../lib/db";

const STOCKS = [
  "AAPL",
  "MSFT",
  "TSLA",
  "AMZN",
  "GOOGL",
  "NVDA",
  "META",
  "JPM",
  "V",
  "NFLX",
  "YPF",
  "GGAL",
  "BMA",
  "PAM",
  "SUPV",
  "BBAR",
  "CEPU",
  "LOMA",
  "EDN",
  "TGS",
];

function toBlob(value: number | null | undefined): Buffer | null {
  if (typeof value !== "number") {
    return null;
  }
  return Buffer.from(Math.trunc(value).toString());
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

async function runBackfill() {
  const now = Date.now();
  const period2 = new Date();
  const period1 = new Date();
  period1.setMonth(period1.getMonth() - 1);

  const yFinance = new YahooFinance();

  try {
    let insertedRows = 0;
    let skippedRows = 0;

    for (const symbol of STOCKS) {
      console.log(`Processing ${symbol}...`);
      
      // Solo logueamos para evitar errores de conexión si no se necesita realmente
      console.log(`Skipping backfill for ${symbol} - not implemented`);
      continue;

      const historical = await yFinance.historical(symbol, {
        period1,
        period2,
        interval: "1d",
      });

      if (historical.length === 0) {
        console.log(`No history found for ${symbol}`);
        continue;
      }

      const values = historical
        .filter((point) => point.date != null)
        .map((point) => {
        const change = point.close != null && point.open != null ? point.close - point.open : null;
        const changePercent =
          change != null && point.open != null && point.open !== 0
            ? (change / point.open) * 100
            : null;

        return {
          symbol,
          price: point.close ?? null,
          change,
          changePercent,
          currency: toNullableString(point.currency),
          marketTime: point.date.getTime(),
          dayHigh: point.high ?? null,
          dayLow: point.low ?? null,
          volume: toBlob(point.volume),
          marketCap: null,
          fetchedAt: point.date.getTime(),
          createdAt: now,
        };
      });

      if (values.length === 0) {
        console.log(`No valid dated points for ${symbol}`);
        continue;
      }

      // El backfill ya no puede ejecutarse porque stockQuotes ya no existe en el nuevo schema
      console.log(`Skipping insert of ${symbol} - stockQuotes not available in current schema`);
    }

    console.log(`Done. Backfill script updated for new schema.`);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

runBackfill();
