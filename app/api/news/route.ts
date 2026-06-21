import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] as any });

const SYMBOLS = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "NVDA", "META"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const perSymbol = Math.max(1, Math.ceil(limit / 3));

    const results = await Promise.allSettled(
      SYMBOLS.slice(0, 4).map(async (symbol) => {
        try {
          const data = await yf.search(symbol, {
            quotesCount: 0,
            newsCount: perSymbol,
          });
          return (data.news ?? []).map((article: any) => ({
            title: article.title,
            description: null,
            url: article.link,
            source: article.publisher ?? "Yahoo Finance",
            publishedAt: article.providerPublishTime
              ? new Date(article.providerPublishTime * 1000).toISOString()
              : new Date().toISOString(),
            thumbnail: article.thumbnail?.resolutions?.[0]?.url ?? null,
          }));
        } catch {
          return [];
        }
      })
    );

    const articles = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<any[]>).value)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

    return NextResponse.json({
      data: articles.slice(0, limit),
      count: Math.min(articles.length, limit),
    });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json({ data: [], count: 0 });
  }
}
