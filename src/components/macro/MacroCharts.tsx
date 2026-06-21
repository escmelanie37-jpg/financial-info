"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";

interface InflationPoint {
  fecha: string;
  valor: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium">{payload[0].value.toFixed(2)}%</p>
    </div>
  );
};

export function MacroCharts() {
  const [data, setData] = useState<InflationPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacion");
        if (!res.ok) throw new Error();
        const json: InflationPoint[] = await res.json();
        setData(json.slice(-60));
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: d.fecha.slice(0, 7),
        inflacion: d.valor,
      })),
    [data]
  );

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse h-48 bg-muted rounded" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center py-8">Sin datos históricos</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Historial de Inflación</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="inflacion"
              stroke="#EF4444"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
