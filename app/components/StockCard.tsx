"use client";

import { StockQuote } from "@/lib/types";

interface StockCardProps {
  stock: StockQuote;
  selected?: boolean;
  onSelect?: (symbol: string) => void;
}

export function StockCard({ stock, selected = false, onSelect }: StockCardProps) {
  const isPositive = (stock.change ?? 0) >= 0;

  return (
    <div
      onClick={() => onSelect?.(stock.symbol)}
      className={`rounded-lg border-2 p-4 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(stock.symbol)}
            className="w-4 h-4 cursor-pointer"
          />
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">
          ${stock.price?.toFixed(2) ?? "—"}
        </span>
        <span
          className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {isPositive ? "+" : ""}
          {stock.change?.toFixed(2) ?? "—"} ({stock.changePercent?.toFixed(2)}%)
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <span className="block text-gray-500">High</span>
          <span className="font-semibold">${stock.dayHigh?.toFixed(2) ?? "—"}</span>
        </div>
        <div>
          <span className="block text-gray-500">Low</span>
          <span className="font-semibold">${stock.dayLow?.toFixed(2) ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
