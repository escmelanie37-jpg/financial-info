"use client";

import { useMemo, useState } from "react";
import { HistoricalDataPoint } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StockChartProps {
  data: HistoricalDataPoint[];
  selectedSymbols: string[];
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
];

type TimeGranularity = "years" | "days" | "hours" | "minutes" | "seconds";

const GRANULARITY_OPTIONS: Array<{ key: TimeGranularity; label: string }> = [
  { key: "years", label: "Años" },
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
];

function getBucketKey(date: Date, granularity: TimeGranularity): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  if (granularity === "years") return `${year}`;
  if (granularity === "days") return `${year}-${month}-${day}`;
  if (granularity === "hours") return `${year}-${month}-${day} ${hours}`;
  if (granularity === "minutes") return `${year}-${month}-${day} ${hours}:${minutes}`;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatLabel(date: Date, granularity: TimeGranularity): string {
  if (granularity === "years") return `${date.getFullYear()}`;
  if (granularity === "days") return date.toLocaleDateString();
  if (granularity === "hours") {
    return `${date.toLocaleDateString()} ${String(date.getHours()).padStart(2, "0")}:00`;
  }
  if (granularity === "minutes") {
    return `${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleTimeString();
}

export function StockChart({ data, selectedSymbols }: StockChartProps) {
  const [granularity, setGranularity] = useState<TimeGranularity>("seconds");

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">Waiting for stock data...</p>
      </div>
    );
  }

  if (selectedSymbols.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">Select stocks to compare</p>
      </div>
    );
  }

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
    const buckets: Record<string, { timestamp: number; data: Record<string, number | null> }> =
      {};

    sorted.forEach((point) => {
      const pointDate = new Date(point.timestamp);
      const bucketKey = getBucketKey(pointDate, granularity);

      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {
          timestamp: point.timestamp,
          data: {},
        };
      }

      // Keep latest point per bucket for each symbol.
      if (point.timestamp >= buckets[bucketKey].timestamp) {
        buckets[bucketKey].timestamp = point.timestamp;
        buckets[bucketKey].data = { ...buckets[bucketKey].data, ...point.data };
      }
    });

    return Object.values(buckets)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((bucket) => ({
        date: formatLabel(new Date(bucket.timestamp), granularity),
        timestamp: bucket.timestamp,
        ...bucket.data,
      }));
  }, [data, granularity]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {GRANULARITY_OPTIONS.map((option) => {
          const active = option.key === granularity;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setGranularity(option.key)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            interval={Math.max(0, Math.floor(chartData.length / 10))}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
            formatter={(value) => {
              if (typeof value === "number") {
                return `$${value.toFixed(2)}`;
              }
              return value;
            }}
          />
          <Legend />
          {selectedSymbols.map((symbol, idx) => (
            <Line
              key={symbol}
              type="monotone"
              dataKey={symbol}
              stroke={COLORS[idx % COLORS.length]}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
              name={symbol}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
