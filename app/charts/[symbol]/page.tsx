"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeframeSelector } from "@/components/charts/TimeframeSelector";
import { ChartStyleSelector, type ChartStyle } from "@/components/charts/ChartStyleSelector";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { AnnotationsPanel } from "@/components/charts/AnnotationsPanel";
import { Loader2 } from "lucide-react";

export default function SymbolChartPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const [timeframe, setTimeframe] = useState("1M");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("candlestick");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{symbol}</h1>
            <p className="text-muted-foreground mt-1">Gráfico de {symbol}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ChartStyleSelector value={chartStyle} onChange={setChartStyle} />
            <TimeframeSelector value={timeframe} onChange={setTimeframe} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <TradingViewChart data={data} chartType={chartStyle} />
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Anotaciones</CardTitle>
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
