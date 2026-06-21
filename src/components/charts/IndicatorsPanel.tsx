"use client";

import { cn } from "@/lib/utils";

interface Indicator {
  id: string;
  label: string;
  enabled: boolean;
}

const defaultIndicators: Indicator[] = [
  { id: "sma20", label: "SMA 20", enabled: false },
  { id: "sma50", label: "SMA 50", enabled: false },
  { id: "sma200", label: "SMA 200", enabled: false },
  { id: "ema9", label: "EMA 9", enabled: false },
  { id: "ema21", label: "EMA 21", enabled: false },
  { id: "bb", label: "Bollinger Bands", enabled: false },
  { id: "rsi", label: "RSI", enabled: false },
  { id: "macd", label: "MACD", enabled: false },
];

interface IndicatorsPanelProps {
  indicators?: Indicator[];
  onChange?: (indicators: Indicator[]) => void;
}

export function IndicatorsPanel({ indicators = defaultIndicators, onChange }: IndicatorsPanelProps) {
  const toggle = (id: string) => {
    if (!onChange) return;
    onChange(
      indicators.map((ind) =>
        ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
      )
    );
  };

  return (
    <div className="space-y-1">
      {indicators.map((ind) => (
        <button
          key={ind.id}
          onClick={() => toggle(ind.id)}
          className={cn(
            "w-full text-left px-2 py-1.5 text-xs rounded transition-colors",
            ind.enabled
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {ind.label}
        </button>
      ))}
    </div>
  );
}
