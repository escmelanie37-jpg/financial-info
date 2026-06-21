import { NextResponse } from "next/server";
import { fetchQuotes, type QuoteResult } from "@/lib/services/yahooFinance";
import {
  fetchRentafija,
  findMaeQuoteForSymbol,
  maeCotizacionToQuote,
} from "@/lib/services/mae";
import { AVAILABLE_STOCKS } from "@/lib/stocks";

const BOND_SYMBOLS = AVAILABLE_STOCKS.filter((s) => s.type === "bond").map((s) => s.symbol);

function hasPrice(q: QuoteResult | undefined): boolean {
  return q != null && q.price != null;
}

function mergeBondQuotes(
  yahooQuotes: QuoteResult[],
  rentafija: Awaited<ReturnType<typeof fetchRentafija>>
): QuoteResult[] {
  const yahooBySymbol = new Map(yahooQuotes.map((q) => [q.symbol, q]));

  return BOND_SYMBOLS.map((symbol) => {
    const yahoo = yahooBySymbol.get(symbol);
    if (hasPrice(yahoo)) return yahoo!;

    const mae = findMaeQuoteForSymbol(symbol, rentafija);
    if (mae) return maeCotizacionToQuote(symbol, mae);

    return (
      yahoo ?? {
        symbol,
        price: null,
        change: null,
        changePercent: null,
        currency: null,
        marketTime: null,
        dayHigh: null,
        dayLow: null,
        volume: null,
        marketCap: null,
      }
    );
  });
}

export async function GET() {
  try {
    const nonBondSymbols = AVAILABLE_STOCKS.filter((s) => s.type !== "bond").map(
      (s) => s.symbol
    );

    const [yahooNonBonds, yahooBonds, rentafija] = await Promise.all([
      fetchQuotes(nonBondSymbols),
      fetchQuotes(BOND_SYMBOLS).catch(() => [] as QuoteResult[]),
      fetchRentafija().catch(() => []),
    ]);

    const bondQuotes = mergeBondQuotes(yahooBonds, rentafija);
    const data = [...yahooNonBonds, ...bondQuotes];

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
      bondsFromMae: bondQuotes.filter((q) => hasPrice(q)).length,
    });
  } catch (error) {
    console.error("Stock fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching stock data" },
      { status: 500 }
    );
  }
}
