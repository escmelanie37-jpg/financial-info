import { NextResponse } from "next/server";
import { fetchDolarRates, calculateGap } from "@/lib/services/dolarapi";
import { fetchInflationSummary, fetchReserves } from "@/lib/services/argenstats";

export async function GET() {
  try {
    const [dolarData, inflation, reserves] = await Promise.allSettled([
      fetchDolarRates(),
      fetchInflationSummary(),
      fetchReserves(),
    ]);

    const fxGap = dolarData.status === "fulfilled" && dolarData.value
      ? {
          official: dolarData.value.oficial?.venta ?? null,
          blue: dolarData.value.blue?.venta ?? null,
          gap:
            dolarData.value.oficial?.venta && dolarData.value.blue?.venta
              ? calculateGap(dolarData.value.blue.venta, dolarData.value.oficial.venta)
              : null,
          date: dolarData.value.lastUpdated,
        }
      : null;

    return NextResponse.json({
      inflation: inflation.status === "fulfilled" ? inflation.value : null,
      reserves: reserves.status === "fulfilled" ? reserves.value : null,
      fxGap,
    });
  } catch (error) {
    console.error("Macro fetch error:", error);
    return NextResponse.json({
      inflation: null,
      reserves: null,
      fxGap: null,
    });
  }
}
