import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 📊 GET /api/stocks/history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxRecords = parseInt(searchParams.get("limit") ?? "100");

    // Como no existe stockQuotes en el nuevo schema, retornamos un array vacío
    const records: any[] = [];

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
