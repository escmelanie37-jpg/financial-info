"use client";

import { useEffect, useRef } from "react";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type ChartStyle = "candlestick" | "line";

interface TradingViewChartProps {
  data: Candle[];
  chartType?: ChartStyle;
  indicators?: string[];
  compareSymbols?: string[];
  compareData?: Record<string, { time: number; value: number }[]>;
  height?: number;
}

function calcSMA(data: Candle[], period: number): { time: number; value: number }[] {
  if (data.length < period) return [];
  const result: { time: number; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function calcEMA(data: Candle[], period: number): { time: number; value: number }[] {
  if (data.length < period) return [];
  const result: { time: number; value: number }[] = [];
  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  result.push({ time: data[period - 1].time, value: ema });
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

const COMPARE_COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6"];

export function TradingViewChart({ data, chartType = "candlestick", indicators = [], compareSymbols = [], compareData = {}, height = 400 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    async function init() {
      if (!containerRef.current || data.length === 0) return;

      const { createChart, ColorType, CandlestickSeries, LineSeries } = await import("lightweight-charts");

      if (chartRef.current) {
        chartRef.current.remove();
        seriesRef.current.clear();
      }

      const chart = createChart(containerRef.current, {
        height,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#9CA3AF",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.05)" },
          horzLines: { color: "rgba(255,255,255,0.05)" },
        },
        crosshair: {
          mode: 0,
          vertLine: { color: "#3B82F6", width: 1, style: 2 },
          horzLine: { color: "#3B82F6", width: 1, style: 2 },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.1)",
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.1)",
          timeVisible: true,
        },
      });

      if (chartType === "candlestick") {
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#22C55E",
          downColor: "#EF4444",
          borderDownColor: "#EF4444",
          borderUpColor: "#22C55E",
          wickDownColor: "#EF4444",
          wickUpColor: "#22C55E",
        });
        candleSeries.setData(data as any);
      } else {
        const lineSeries = chart.addSeries(LineSeries, {
          color: "#3B82F6",
          lineWidth: 2,
          priceFormat: { type: "price" as const },
        });
        lineSeries.setData(data.map((c) => ({ time: c.time, value: c.close })) as any);
      }

      const overlaySeries: { id: string; color: string; data: { time: number; value: number }[] }[] = [];

      if (indicators.includes("sma20")) overlaySeries.push({ id: "sma20", color: "#FFD700", data: calcSMA(data, 20) });
      if (indicators.includes("sma50")) overlaySeries.push({ id: "sma50", color: "#FF8C00", data: calcSMA(data, 50) });
      if (indicators.includes("sma200")) overlaySeries.push({ id: "sma200", color: "#DC143C", data: calcSMA(data, 200) });
      if (indicators.includes("ema9")) overlaySeries.push({ id: "ema9", color: "#00BFFF", data: calcEMA(data, 9) });
      if (indicators.includes("ema21")) overlaySeries.push({ id: "ema21", color: "#9370DB", data: calcEMA(data, 21) });

      compareSymbols.forEach((sym, i) => {
        const cd = compareData[sym];
        if (cd && cd.length > 0) {
          overlaySeries.push({ id: `compare:${sym}`, color: COMPARE_COLORS[i % COMPARE_COLORS.length], data: cd });
        }
      });

      for (const line of overlaySeries) {
        if (line.data.length > 0) {
          const ls = chart.addSeries(LineSeries, {
            color: line.color,
            lineWidth: 1,
            lastValueVisible: false,
            priceFormat: { type: "price" as const },
          });
          ls.setData(line.data as any);
          seriesRef.current.set(line.id, ls);
        }
      }

      chart.timeScale().fitContent();
      chartRef.current = chart;
    }

    init();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current.clear();
      }
    };
  }, [data, height, chartType, indicators, compareSymbols, compareData]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
        Sin datos disponibles
      </div>
    );
  }

  return <div ref={containerRef} />;
}
