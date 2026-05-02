import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stockQuotes } from "@/lib/schema";

// 📊 GET /api/stocks/history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxRecords = parseInt(searchParams.get("limit") ?? "100");

    const records = await db.query.stockQuotes.findMany({
      limit: maxRecords,
      orderBy: (stockQuotes, { desc }) => [desc(stockQuotes.fetchedAt)],
    });

    return NextResponse.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("History fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error fetching history data",
      },
      { status: 500 }
    );
  }
}
