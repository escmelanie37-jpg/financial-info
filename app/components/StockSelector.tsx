"use client";

import { StockQuote } from "@/lib/types";

interface StockSelectorProps {
  stocks: StockQuote[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function StockSelector({
  stocks,
  selected,
  onChange,
}: StockSelectorProps) {
  const handleToggle = (symbol: string) => {
    const newSelected = selected.includes(symbol)
      ? selected.filter((s) => s !== symbol)
      : [...selected, symbol];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.length === stocks.length) {
      onChange([]);
    } else {
      onChange(stocks.map((s) => s.symbol));
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Select Stocks</h3>
        <button
          onClick={handleSelectAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {selected.length === stocks.length ? "Deselect all" : "Select all"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {stocks.map((stock) => {
          const isSelected = selected.includes(stock.symbol);
          return (
            <button
              key={stock.symbol}
              onClick={() => handleToggle(stock.symbol)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {stock.symbol}
            </button>
          );
        })}
      </div>
    </div>
  );
}
