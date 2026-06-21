import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/services/yahooFinance";
import { calculateLogReturns, calculateVariance, calculateStdDev, calculateVolatility } from "@/lib/utils/calculations";

export async function POST(req: NextRequest) {
  try {
    const { symbol, startDate, endDate } = await req.json();
    if (!symbol || !startDate || !endDate) {
      return NextResponse.json({ error: "symbol, startDate, endDate son requeridos" }, { status: 400 });
    }

    const history = await fetchHistory(symbol, new Date(startDate), new Date(endDate), "1d");
    const prices = history.map((h) => h.close).filter((p): p is number => p !== null);

    if (prices.length < 2) {
      return NextResponse.json({ error: "Datos insuficientes" }, { status: 400 });
    }

    const returns = calculateLogReturns(prices);
    const variance = calculateVariance(returns, 1);
    const stdDev = calculateStdDev(returns, 1);
    const annualizedVolatility = calculateVolatility(returns, 252);

    return NextResponse.json({
      volatility: stdDev,
      annualizedVolatility,
      variance,
      count: returns.length,
    });
  } catch (error) {
    console.error("Risk analysis error:", error);
    return NextResponse.json({ error: "Error al calcular riesgo" }, { status: 500 });
  }
}
