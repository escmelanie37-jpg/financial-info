"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: Candle[];
  height?: number;
}

function formatAxisDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs space-y-1">
      <p className="text-muted-foreground">{d.date}</p>
      <p className="text-foreground">O: {d.open.toFixed(2)}</p>
      <p className="text-foreground">H: {d.high.toFixed(2)}</p>
      <p className="text-foreground">L: {d.low.toFixed(2)}</p>
      <p className="text-foreground font-medium">C: {d.close.toFixed(2)}</p>
      {d.volume && <p className="text-muted-foreground">Vol: {d.volume.toLocaleString()}</p>}
    </div>
  );
};

export function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        color: d.close >= d.open ? "#22C55E" : "#EF4444",
      })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
        Sin datos disponibles
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="volume" fill="hsl(var(--muted))" opacity={0.3} maxBarSize={300 / Math.max(data.length, 1)} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="hsl(var(--accent))"
            dot={false}
            strokeWidth={1.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
