"use client";

import { useState } from "react";
import { AVAILABLE_STOCKS, ASSET_GROUPS, type StockInfo } from "@/lib/stocks";

interface ComparisonPanelProps {
  symbols?: string[];
  onChange?: (symbols: string[]) => void;
  excludeSymbol?: string;
}

export function ComparisonPanel({ symbols = [], onChange, excludeSymbol }: ComparisonPanelProps) {
  const [selected, setSelected] = useState("");

  const add = () => {
    if (!onChange || !selected) return;
    if (!symbols.includes(selected) && symbols.length < 5) {
      onChange([...symbols, selected]);
    }
    setSelected("");
  };

  const remove = (sym: string) => {
    if (!onChange) return;
    onChange(symbols.filter((s) => s !== sym));
  };

  const isAvailable = (s: StockInfo) =>
    !symbols.includes(s.symbol) && s.symbol !== excludeSymbol;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent min-w-0"
        >
          <option value="">Seleccionar...</option>
          {ASSET_GROUPS.map((group) => {
            const assets = AVAILABLE_STOCKS.filter(group.filter).filter(isAvailable);
            if (assets.length === 0) return null;
            return (
              <optgroup key={group.label} label={group.label}>
                {assets.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} — {s.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <button
          onClick={add}
          disabled={symbols.length >= 5 || !selected}
          className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 disabled:opacity-50"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {symbols.map((sym) => (
          <span
            key={sym}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
          >
            {sym}
            <button onClick={() => remove(sym)} className="hover:text-negative">&times;</button>
          </span>
        ))}
      </div>
    </div>
  );
}
