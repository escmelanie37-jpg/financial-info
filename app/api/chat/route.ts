import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stockQuotes } from "@/lib/schema";
import { desc, inArray } from "drizzle-orm";

type ChatRequest = {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  apiKey?: string;
};

function parseSymbols(text: string, availableSymbols: string[]): string[] {
  const matches = text.toUpperCase().match(/\b[A-Z]{1,5}\b/g) ?? [];
  const unique = Array.from(new Set(matches));
  return unique.filter((symbol) => availableSymbols.includes(symbol));
}

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return "N/A";
  const ms = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  return new Date(ms).toISOString();
}

function decodeNumericBlob(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (value instanceof Uint8Array) {
    const text = Buffer.from(value).toString("utf-8");
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const message = body.message?.trim();
    const apiKey = body.apiKey?.trim();
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "A valid Groq API key is required." },
        { status: 400 }
      );
    }

    const recentRows = await db.query.stockQuotes.findMany({
      limit: 500,
      orderBy: [desc(stockQuotes.fetchedAt)],
    });

    const availableSymbols = Array.from(new Set(recentRows.map((row) => row.symbol)));
    const textForDetection = `${message}\n${history
      .map((item) => item.content)
      .join("\n")}`;
    const detectedSymbols = parseSymbols(textForDetection, availableSymbols);

    const latestBySymbol = new Map<string, (typeof recentRows)[number]>();
    for (const row of recentRows) {
      if (!latestBySymbol.has(row.symbol)) {
        latestBySymbol.set(row.symbol, row);
      }
    }

    const fallbackSymbols = availableSymbols.slice(0, 5);
    const selectedSymbols = detectedSymbols.length > 0 ? detectedSymbols : fallbackSymbols;

    const selectedRows = await db.query.stockQuotes.findMany({
      where: inArray(stockQuotes.symbol, selectedSymbols),
      limit: 200,
      orderBy: [desc(stockQuotes.fetchedAt)],
    });

    const latestSelectedRows = selectedSymbols
      .map((symbol) => latestBySymbol.get(symbol))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    const snapshot = latestSelectedRows.map((row) => ({
      symbol: row.symbol,
      price: row.price,
      change: row.change,
      changePercent: row.changePercent,
      dayHigh: row.dayHigh,
      dayLow: row.dayLow,
      volume: decodeNumericBlob(row.volume),
      marketCap: decodeNumericBlob(row.marketCap),
      currency: row.currency,
      marketTime: formatTimestamp(row.marketTime),
      fetchedAt: formatTimestamp(row.fetchedAt),
    }));

    const fetchedAtValues = selectedRows
      .map((row) => row.fetchedAt)
      .filter((value): value is number => typeof value === "number");
    const minFetchedAt = fetchedAtValues.length > 0 ? Math.min(...fetchedAtValues) : null;
    const maxFetchedAt = fetchedAtValues.length > 0 ? Math.max(...fetchedAtValues) : null;

    const systemPrompt = [
      "You are a financial assistant for a US stocks dashboard.",
      "You can answer any finance question, but prioritize and cite the provided internal DB context when relevant.",
      "If context is missing for a specific request, say it clearly and provide a general educational answer.",
      "Do not provide personalized investment advice.",
      "Keep responses concise and practical.",
      "End with a one-line disclaimer: 'Educational information only, not investment advice.'",
    ].join(" ");

    const contextPrompt = [
      "Internal database context:",
      `- Table: stock_quotes`,
      `- Symbols in context: ${selectedSymbols.join(", ") || "none"}`,
      `- Date range (fetchedAt): ${formatTimestamp(minFetchedAt)} to ${formatTimestamp(
        maxFetchedAt
      )}`,
      `- Latest snapshot per symbol:`,
      JSON.stringify(snapshot, null, 2),
      "Use this context when useful and mention data recency in your answer.",
    ].join("\n");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        messages: [
          { role: "system", content: `${systemPrompt}\n\n${contextPrompt}` },
          ...history.map((item) => ({
            role: item.role,
            content: item.content,
          })),
          { role: "user", content: message },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return NextResponse.json(
        { error: `Groq request failed: ${errorText}` },
        { status: groqResponse.status }
      );
    }

    const completion = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ??
      "I could not generate a response this time.";

    return NextResponse.json({
      answer,
      metadata: {
        tables: ["stock_quotes"],
        symbols: selectedSymbols,
        fields: [
          "price",
          "change",
          "changePercent",
          "dayHigh",
          "dayLow",
          "volume",
          "marketCap",
          "currency",
          "marketTime",
          "fetchedAt",
        ],
        dateRange: {
          from: formatTimestamp(minFetchedAt),
          to: formatTimestamp(maxFetchedAt),
        },
        recordsConsidered: selectedRows.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Unexpected error while generating answer." },
      { status: 500 }
    );
  }
}
