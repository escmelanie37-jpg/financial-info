import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export interface QuoteResult {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  marketTime: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  marketCap: number | null;
}

export interface HistoricalResult {
  date: Date;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  adjClose: number | null;
}

function normalizeQuote(quote: any): QuoteResult {
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

export async function fetchQuote(symbol: string): Promise<QuoteResult> {
  const quote = await yf.quote(symbol);
  return normalizeQuote(quote);
}

export async function fetchQuotes(symbols: string[]): Promise<QuoteResult[]> {
  // Try batch first (more efficient), fall back to individual per symbol if batch fails
  const BATCH_SIZE = 20;
  const results: QuoteResult[] = [];

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    try {
      const batchResult = await yf.quote(batch);
      const items = Array.isArray(batchResult) ? batchResult : [batchResult];
      results.push(...items.map(normalizeQuote));
    } catch {
      // Batch failed (likely some symbols not found) — try individually
      const individual = await Promise.allSettled(batch.map((s) => yf.quote(s)));
      for (const r of individual) {
        if (r.status === "fulfilled") {
          results.push(normalizeQuote(r.value));
        }
      }
    }
  }

  return results;
}

export async function fetchHistory(
  symbol: string,
  period1: Date,
  period2: Date = new Date(),
  interval: "1d" | "1wk" | "1mo" = "1d"
): Promise<HistoricalResult[]> {
  const result = await yf.historical(symbol, { period1, period2, interval });
  return result.map((point) => ({
    date: point.date,
    open: point.open ?? null,
    high: point.high ?? null,
    low: point.low ?? null,
    close: point.close ?? null,
    volume: point.volume ?? null,
    adjClose: point.adjClose ?? null,
  }));
}

export async function fetchHistoryMonths(
  symbol: string,
  months: number = 6
): Promise<HistoricalResult[]> {
  const now = new Date();
  const period2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const period1 = new Date(period2);
  period1.setMonth(period1.getMonth() - months);
  return fetchHistory(symbol, period1, period2);
}
