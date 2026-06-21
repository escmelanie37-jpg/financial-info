"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/layout/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimeframeSelector } from "@/components/charts/TimeframeSelector";
import { ChartStyleSelector, type ChartStyle } from "@/components/charts/ChartStyleSelector";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { IndicatorsPanel } from "@/components/charts/IndicatorsPanel";
import { ComparisonPanel } from "@/components/charts/ComparisonPanel";
import { AnnotationsPanel } from "@/components/charts/AnnotationsPanel";
import { Loader2 } from "lucide-react";
import { AVAILABLE_STOCKS, ASSET_GROUPS } from "@/lib/stocks";

interface Indicator {
  id: string;
  label: string;
  enabled: boolean;
}

export default function ChartsPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1M");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("candlestick");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [compareSymbols, setCompareSymbols] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<Record<string, { time: number; value: number }[]>>({});
  const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([
    { id: "sma20", label: "SMA 20", enabled: false },
    { id: "sma50", label: "SMA 50", enabled: false },
    { id: "sma200", label: "SMA 200", enabled: false },
    { id: "ema9", label: "EMA 9", enabled: false },
    { id: "ema21", label: "EMA 21", enabled: false },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/charts/${symbol}?timeframe=${timeframe}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    async function loadCompare() {
      const results: Record<string, { time: number; value: number }[]> = {};
      for (const sym of compareSymbols) {
        try {
          const res = await fetch(`/api/charts/${sym}?timeframe=${timeframe}`);
          if (!res.ok) continue;
          const json = await res.json();
          const arr: any[] = json.data ?? [];
          results[sym] = arr.map((c: any) => ({ time: c.time, value: c.close }));
        } catch {
          // skip
        }
      }
      setCompareData(results);
    }
    loadCompare();
  }, [compareSymbols, timeframe, symbol]);

  const enabledIndicators = activeIndicators.filter((i) => i.enabled).map((i) => i.id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gráficos</h1>
          <p className="text-muted-foreground mt-1">Velas, indicadores y comparaciones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:border-accent max-w-[220px] sm:max-w-none"
                  >
                    {ASSET_GROUPS.map((group) => {
                      const assets = AVAILABLE_STOCKS.filter(group.filter);
                      if (assets.length === 0) return null;
                      return (
                        <optgroup key={group.label} label={group.label}>
                          {assets.map((s) => (
                            <option key={s.symbol} value={s.symbol}>
                              {s.symbol} — {s.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <div className="flex items-center gap-3 flex-wrap">
                    <ChartStyleSelector value={chartStyle} onChange={setChartStyle} />
                    <TimeframeSelector value={timeframe} onChange={setTimeframe} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <TradingViewChart
                    data={data}
                    chartType={chartStyle}
                    indicators={enabledIndicators}
                    compareSymbols={compareSymbols}
                    compareData={compareData}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm font-medium">Indicadores</p>
              </CardHeader>
              <CardContent>
                <IndicatorsPanel
                  indicators={activeIndicators}
                  onChange={setActiveIndicators}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm font-medium">Comparar <span className="text-xs text-muted-foreground font-normal">(máx 5)</span></p>
              </CardHeader>
              <CardContent>
                <ComparisonPanel
                  symbols={compareSymbols}
                  onChange={setCompareSymbols}
                  excludeSymbol={symbol}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm font-medium">Anotaciones</p>
              </CardHeader>
              <CardContent>
                <AnnotationsPanel symbol={symbol} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
