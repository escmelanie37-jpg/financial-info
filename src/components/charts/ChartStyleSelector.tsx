"use client";

import { cn } from "@/lib/utils";
import { CandlestickChart, LineChart } from "lucide-react";

export type ChartStyle = "candlestick" | "line";

const styles: { value: ChartStyle; label: string; icon: typeof CandlestickChart }[] = [
  { value: "candlestick", label: "Velas", icon: CandlestickChart },
  { value: "line", label: "Línea", icon: LineChart },
];

interface ChartStyleSelectorProps {
  value: ChartStyle;
  onChange: (style: ChartStyle) => void;
}

export function ChartStyleSelector({ value, onChange }: ChartStyleSelectorProps) {
  return (
    <div className="flex gap-1">
      {styles.map(({ value: styleValue, label, icon: Icon }) => (
        <button
          key={styleValue}
          type="button"
          onClick={() => onChange(styleValue)}
          title={label}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors",
            value === styleValue
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
