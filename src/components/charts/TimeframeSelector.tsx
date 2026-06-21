"use client";

import { cn } from "@/lib/utils";

const timeframes = [
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "3Y", label: "3Y" },
  { value: "5Y", label: "5Y" },
  { value: "MAX", label: "MAX" },
];

interface TimeframeSelectorProps {
  value: string;
  onChange: (timeframe: string) => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-1">
      {timeframes.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onChange(tf.value)}
          className={cn(
            "px-2.5 py-1 text-xs rounded transition-colors",
            value === tf.value
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
