import { NextResponse } from "next/server";
import { fetchDerivadosData, filterBondQuotes } from "@/lib/services/mae";
import { AVAILABLE_STOCKS } from "@/lib/stocks";

function yahooToMaeTicker(symbol: string): string {
  return symbol.replace(/\.BA$/i, "").replace(/D$/i, "");
}

export async function GET() {
  try {
    const data = await fetchDerivadosData();
    const bondTickers = AVAILABLE_STOCKS.filter((s) => s.type === "bond").map((s) =>
      yahooToMaeTicker(s.symbol)
    );
    const bonosMae = filterBondQuotes(data.rentafija, bondTickers);

    return NextResponse.json({
      success: true,
      ...data,
      bonosMae,
    });
  } catch (error) {
    console.error("Derivados fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching MAE market data",
        rentafija: [],
        cauciones: [],
        forex: [],
        bonosMae: [],
      },
      { status: 500 }
    );
  }
}
