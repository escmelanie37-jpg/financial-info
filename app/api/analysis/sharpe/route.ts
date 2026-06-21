import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/services/yahooFinance";
import { calculateLogReturns, calculateSharpeRatio, calculateMean, calculateStdDev } from "@/lib/utils/calculations";

export async function POST(req: NextRequest) {
  try {
    const { symbol, startDate, endDate, riskFreeRate } = await req.json();
    if (!symbol || !startDate || !endDate) {
      return NextResponse.json({ error: "symbol, startDate, endDate son requeridos" }, { status: 400 });
    }

    const history = await fetchHistory(symbol, new Date(startDate), new Date(endDate), "1d");
    const prices = history.map((h) => h.close).filter((p): p is number => p !== null);

    if (prices.length < 2) {
      return NextResponse.json({ error: "Datos insuficientes" }, { status: 400 });
    }

    const returns = calculateLogReturns(prices);
    const rfr = riskFreeRate ?? 0.03;
    const sharpeRatio = calculateSharpeRatio(returns, rfr, 252);

    const meanReturn = calculateMean(returns);
    const annualizedReturn = Math.pow(1 + meanReturn, 252) - 1;
    const stdDev = calculateStdDev(returns, 1);
    const annualizedVolatility = stdDev * Math.sqrt(252);

    return NextResponse.json({
      sharpeRatio,
      annualizedReturn,
      annualizedVolatility,
      riskFreeRate: rfr,
    });
  } catch (error) {
    console.error("Sharpe analysis error:", error);
    return NextResponse.json({ error: "Error al calcular Sharpe" }, { status: 500 });
  }
}
