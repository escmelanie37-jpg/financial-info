import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/services/yahooFinance";
import {
  calculateLogReturns,
  calculateCumulativeReturn,
  calculateAnnualizedReturn,
} from "@/lib/utils/calculations";

export async function POST(req: NextRequest) {
  try {
    const { symbol, startDate, endDate } = await req.json();
    if (!symbol || !startDate || !endDate) {
      return NextResponse.json({ error: "symbol, startDate, endDate son requeridos" }, { status: 400 });
    }

    const history = await fetchHistory(
      symbol,
      new Date(startDate),
      new Date(endDate),
      "1d"
    );

    const prices = history.map((h) => h.close).filter((p): p is number => p !== null);
    if (prices.length < 2) {
      return NextResponse.json({ error: "Datos insuficientes" }, { status: 400 });
    }

    const logReturns = calculateLogReturns(prices);
    const cumulativeReturn = calculateCumulativeReturn(prices);
    const days = prices.length;
    const annualizedReturn = calculateAnnualizedReturn(prices, days);

    return NextResponse.json({
      logReturns,
      cumulativeReturn,
      annualizedReturn,
      count: logReturns.length,
      startPrice: prices[0],
      endPrice: prices[prices.length - 1],
    });
  } catch (error) {
    console.error("Returns analysis error:", error);
    return NextResponse.json({ error: "Error al calcular retornos" }, { status: 500 });
  }
}
