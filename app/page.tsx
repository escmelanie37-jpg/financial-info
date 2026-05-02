"use client";

import { useState } from "react";
import { useStockPoller } from "@/app/hooks/useStockPoller";
import { StockCard } from "@/app/components/StockCard";
import { StockTable } from "@/app/components/StockTable";
import { StockChart } from "@/app/components/StockChart";
import { StockSelector } from "@/app/components/StockSelector";
import { FinanceChatDialog } from "@/app/components/FinanceChatDialog";

export default function Home() {
  const { current, historical, loading, error, stop, start, refetch } =
    useStockPoller(5000);

  const [selectedSymbols, setSelectedSymbols] = useState<string>("");

  const stocks = Object.values(current).sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );

  const selected = selectedSymbols
    .split(",")
    .filter((s) => s && stocks.some((st) => st.symbol === s));

  const handleSelectChange = (newSelected: string[]) => {
    setSelectedSymbols(newSelected.join(","));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Stock Monitor</h1>
            <p className="mt-1 text-gray-600">
              Real-time stock prices updated every 5 seconds
            </p>
          </div>

          <div className="flex gap-2">
            <span
              className={`rounded-lg px-4 py-2 text-white ${
                loading
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Updating" : "Up to date"}
            </span>

            <FinanceChatDialog />
          </div>
        </div>

        {/* Status */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <div>
                <span className="text-gray-600">Status: </span>
                <span
                  className={`font-semibold ${
                    loading ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {loading ? "● Live" : "● Paused"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Data Points: </span>
                <span className="font-semibold text-gray-900">
                  {historical.length}
                </span>
              </div>
              {error && (
                <div className="text-red-600">
                  <span>Error: </span>
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="text-gray-600">
              Current Time:{" "}
              <span className="font-semibold">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stock Cards Grid */}
        {stocks.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Stock Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {stocks.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
        )}

        {/* Stock Selector */}
        {stocks.length > 0 && (
          <StockSelector
            stocks={stocks}
            selected={selected}
            onChange={handleSelectChange}
          />
        )}

        {/* Chart */}
        {stocks.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Price Trend
            </h2>
            <StockChart data={historical} selectedSymbols={selected} />
          </div>
        )}

        {/* Stock Table */}
        {stocks.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Detailed Data
            </h2>
            <StockTable stocks={stocks} />
          </div>
        )}
      </div>
    </div>
  );
}
