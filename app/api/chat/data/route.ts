import { NextResponse } from "next/server";
import { fetchQuote, fetchQuotes, fetchHistoryMonths } from "@/lib/services/yahooFinance";
import type { QuoteResult, HistoricalResult } from "@/lib/services/yahooFinance";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, symbol, symbols, months } = body;

    switch (type) {
      case "quote": {
        if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
        const data = await fetchQuote(symbol);
        return NextResponse.json({ data });
      }
      case "quotes": {
        const list: string[] = symbols ?? [];
        if (list.length === 0) return NextResponse.json({ error: "symbols required" }, { status: 400 });
        const data = await fetchQuotes(list);
        return NextResponse.json({ data });
      }
      case "history": {
        if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
        const monthsCount = months ?? 12;
        const data = await fetchHistoryMonths(symbol, monthsCount);
        return NextResponse.json({ data });
      }
      default:
        return NextResponse.json({ error: "unknown type" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("Chat data API error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
