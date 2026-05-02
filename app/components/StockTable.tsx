"use client";

import { StockQuote } from "@/lib/types";

interface StockTableProps {
  stocks: StockQuote[];
}

export function StockTable({ stocks }: StockTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              TICKER
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">
              PRICE
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">
              CHG $
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">
              CHG %
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">
              HIGH
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">
              LOW
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">
              VOLUME
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">
              CURRENCY
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {stocks.map((stock) => {
            const isPositive = (stock.change ?? 0) >= 0;
            return (
              <tr key={stock.symbol} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {stock.symbol}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-900">
                  ${stock.price?.toFixed(2) ?? "—"}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono font-semibold ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {stock.change?.toFixed(2) ?? "—"}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono font-semibold ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {stock.changePercent?.toFixed(2) ?? "—"}%
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-600">
                  ${stock.dayHigh?.toFixed(2) ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-600">
                  ${stock.dayLow?.toFixed(2) ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-600">
                  {stock.volume
                    ? (stock.volume / 1000000).toFixed(1) + "M"
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {stock.currency ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
