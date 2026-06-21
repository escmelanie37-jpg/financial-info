import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/services/yahooFinance";

const TIMEFRAME_MAP: Record<string, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "3Y": 1095,
  "5Y": 1825,
  "MAX": 3650,
};

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/charts/[symbol]">
) {
  try {
    const { symbol } = await ctx.params;
    const { searchParams } = _request.nextUrl;
    const timeframe = searchParams.get("timeframe") ?? "1M";
    const days = TIMEFRAME_MAP[timeframe] ?? 30;

    const period1 = new Date();
    period1.setDate(period1.getDate() - days);

    const history = await fetchHistory(symbol.toUpperCase(), period1, new Date(), "1d");

    const data = history
      .filter((h) => h.close !== null && h.open !== null)
      .map((h) => ({
        time: Math.floor(h.date.getTime() / 1000),
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close,
        volume: h.volume,
      }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Chart data error:", error);
    return NextResponse.json({ data: [] });
  }
}
