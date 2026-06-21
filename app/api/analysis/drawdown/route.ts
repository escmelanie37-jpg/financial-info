import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/services/yahooFinance";
import { calculateMaxDrawdown } from "@/lib/utils/calculations";

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

    const result = calculateMaxDrawdown(prices);

    return NextResponse.json({
      maxDrawdown: result.maxDrawdown,
      peakIndex: result.peakIndex,
      troughIndex: result.troughIndex,
      recoveryIndex: result.recoveryIndex,
      peakPrice: prices[result.peakIndex],
      troughPrice: prices[result.troughIndex],
      recoveryPrice: result.recoveryIndex !== null ? prices[result.recoveryIndex] : null,
    });
  } catch (error) {
    console.error("Drawdown analysis error:", error);
    return NextResponse.json({ error: "Error al calcular drawdown" }, { status: 500 });
  }
}
