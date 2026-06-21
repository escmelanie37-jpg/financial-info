"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface AllocationItem {
  label: string;
  value: number;
}

interface AllocationPieChart3DProps {
  data: AllocationItem[];
}

const CHART_COLORS = [
  "#1E4D8C",
  "#36A2EB",
  "#9966FF",
  "#FF6384",
  "#4BC0C0",
  "#FF9F40",
  "#FFCD56",
  "#C9CBCF",
  "#7BC225",
  "#E7717D",
  "#5A9BD5",
  "#A084CA",
];

export function getAllocationColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

function AllocationTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { label: string; value: number; color: string };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const label = String(item.name ?? item.payload?.label ?? "");
  const value = item.value ?? item.payload?.value;
  const color = item.payload?.color ?? getAllocationColor(0);

  return (
    <div
      className="rounded-md px-3 py-2 shadow-lg text-white text-sm pointer-events-none"
      style={{ backgroundColor: "#000" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium">{label}</span>
      </div>
      <p className="mt-1 pl-5 tabular-nums">{value}%</p>
    </div>
  );
}

export function AllocationPieChart3D({ data }: AllocationPieChart3DProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No hay posiciones en tu portafolio
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    color: getAllocationColor(index),
  }));

  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius="88%"
            innerRadius={0}
            dataKey="value"
            nameKey="label"
            paddingAngle={0}
            stroke="none"
            isAnimationActive
            animationDuration={600}
          >
            {chartData.map((entry) => (
              <Cell key={entry.label} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={<AllocationTooltip />}
            cursor={false}
            wrapperStyle={{
              zIndex: 20,
              outline: "none",
              background: "transparent",
              border: "none",
            }}
            contentStyle={{
              background: "transparent",
              border: "none",
              padding: 0,
              boxShadow: "none",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
