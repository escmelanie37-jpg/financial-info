import { NextResponse } from "next/server";
import { fetchQuote } from "@/lib/services/yahooFinance";

const INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "Nasdaq" },
  { symbol: "^DJI", name: "Dow Jones" },
  { symbol: "^MERV", name: "MERVAL" },
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      INDICES.map(async (idx) => {
        try {
          const q = await fetchQuote(idx.symbol);
          return {
            symbol: idx.symbol,
            name: idx.name,
            price: q.price,
            change: q.change,
            changePercent: q.changePercent,
          };
        } catch {
          return {
            symbol: idx.symbol,
            name: idx.name,
            price: null,
            change: null,
            changePercent: null,
          };
        }
      })
    );

    const data = results.map((r) =>
      r.status === "fulfilled" ? r.value : { symbol: "?", name: "Error", price: null, change: null, changePercent: null }
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Indices fetch error:", error);
    return NextResponse.json({ data: [] });
  }
}
