import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/services/yahooFinance";
import { calculateLogReturns, calculateBeta, calculateCorrelation } from "@/lib/utils/calculations";

export async function POST(req: NextRequest) {
  try {
    const { symbol, benchmark, startDate, endDate } = await req.json();
    if (!symbol || !benchmark || !startDate || !endDate) {
      return NextResponse.json({ error: "symbol, benchmark, startDate, endDate son requeridos" }, { status: 400 });
    }

    const [assetHistory, marketHistory] = await Promise.all([
      fetchHistory(symbol, new Date(startDate), new Date(endDate), "1d"),
      fetchHistory(benchmark, new Date(startDate), new Date(endDate), "1d"),
    ]);

    const assetPrices = assetHistory.map((h) => h.close).filter((p): p is number => p !== null);
    const marketPrices = marketHistory.map((h) => h.close).filter((p): p is number => p !== null);

    const minLen = Math.min(assetPrices.length, marketPrices.length);
    if (minLen < 2) {
      return NextResponse.json({ error: "Datos insuficientes" }, { status: 400 });
    }

    const assetReturns = calculateLogReturns(assetPrices.slice(0, minLen));
    const marketReturns = calculateLogReturns(marketPrices.slice(0, minLen));

    const beta = calculateBeta(assetReturns, marketReturns);
    const correlation = calculateCorrelation(assetReturns, marketReturns);

    return NextResponse.json({
      beta,
      covariance: 0,
      marketVariance: 0,
      correlation,
      assetReturns: assetReturns.slice(-5),
      marketReturns: marketReturns.slice(-5),
    });
  } catch (error) {
    console.error("Beta analysis error:", error);
    return NextResponse.json({ error: "Error al calcular Beta" }, { status: 500 });
  }
}
