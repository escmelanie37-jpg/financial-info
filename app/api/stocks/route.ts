import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { db } from "@/lib/db";
import { stockQuotes } from "@/lib/schema";

// 📊 Lista de stocks para probar
const STOCKS = [
  "AAPL",
  "MSFT",
  "TSLA",
  "AMZN",
  "GOOGL",

  // 🇺🇸 USA adicionales
  "NVDA",
  "META",
  "JPM",
  "V",
  "NFLX",

  // 🇦🇷 Argentina (ADRs / BYMA / CEDEARs en Yahoo Finance)
  "YPF",
  "GGAL",
  "BMA",
  "PAM",
  "SUPV",
  "BBAR",
  "CEPU",
  "LOMA",
  "EDN",
  "TGS"
];

function normalizeQuote(quote: any) {
  return {
    symbol: quote.symbol,
    price: quote.regularMarketPrice ?? null,
    change: quote.regularMarketChange ?? null,
    changePercent: quote.regularMarketChangePercent ?? null,
    currency: quote.currency ?? null,
    marketTime: quote.regularMarketTime ?? null,
    dayHigh: quote.regularMarketDayHigh ?? null,
    dayLow: quote.regularMarketDayLow ?? null,
    volume: quote.regularMarketVolume ?? null,
    marketCap: quote.marketCap ?? null,
  };
}

// 📡 GET /api/stocks
export async function GET() {
  try {
    const now = Date.now();
    const results = await Promise.all(
      STOCKS.map(async (symbol) => {
        const yFinance = new YahooFinance();
        const quote = await yFinance.quote(symbol);
        const normalized = normalizeQuote(quote);

        await db.insert(stockQuotes).values({
          symbol: normalized.symbol,
          price: normalized.price,
          change: normalized.change,
          changePercent: normalized.changePercent,
          currency: normalized.currency,
          marketTime: normalized.marketTime,
          dayHigh: normalized.dayHigh,
          dayLow: normalized.dayLow,
          volume: normalized.volume ? Buffer.from(normalized.volume.toString()) : null,
          marketCap: normalized.marketCap ? Buffer.from(normalized.marketCap.toString()) : null,
          fetchedAt: now,
          createdAt: now,
        });

        return normalized;
      })
    );

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Stock fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error fetching stock data",
      },
      { status: 500 }
    );
  }
}