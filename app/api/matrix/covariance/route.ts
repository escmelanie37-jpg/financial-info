import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/services/yahooFinance";
import { calculateLogReturns, calculateCovarianceMatrix, calculateCorrelationMatrix } from "@/lib/utils/calculations";

export async function POST(req: NextRequest) {
  try {
    const { symbols, startDate, endDate } = await req.json();
    if (!symbols || symbols.length < 2 || !startDate || !endDate) {
      return NextResponse.json({ error: "symbols (min 2), startDate, endDate son requeridos" }, { status: 400 });
    }

    const results = await Promise.all(
      symbols.map((symbol: string) =>
        fetchHistory(symbol, new Date(startDate), new Date(endDate), "1d")
      )
    );

    const pricesMatrix = results.map((history) =>
      (history as { close: number | null }[]).map((h) => h.close).filter((p): p is number => p !== null)
    );

    const minLen = Math.min(...pricesMatrix.map((p) => p.length));
    if (minLen < 2) {
      return NextResponse.json({ error: "Datos insuficientes para uno o más activos" }, { status: 400 });
    }

    const returnsMatrix = pricesMatrix.map((prices) =>
      calculateLogReturns(prices.slice(0, minLen))
    );

    const covarianceMatrix = calculateCovarianceMatrix(returnsMatrix);
    const correlationMatrix = calculateCorrelationMatrix(covarianceMatrix);

    return NextResponse.json({
      symbols,
      covarianceMatrix,
      correlationMatrix,
      observations: returnsMatrix[0].length,
    });
  } catch (error) {
    console.error("Covariance matrix error:", error);
    return NextResponse.json({ error: "Error al calcular matriz de covarianza" }, { status: 500 });
  }
}
