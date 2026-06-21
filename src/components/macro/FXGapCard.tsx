"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatARS, formatPercent } from "@/lib/utils/formatters";

interface FXGapData {
  official: number | null;
  blue: number | null;
  gap: number | null;
  date: string | null;
}

export function FXGapCard() {
  const [data, setData] = useState<FXGapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/macro");
        if (!res.ok) throw new Error();
        const result = await res.json();
        setData(result.fxGap ?? null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Brecha Cambiaria</h3>
      {!data ? (
        <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Dólar Oficial</span>
            <span className="text-sm font-medium text-foreground">{formatARS(data.official)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Dólar Blue</span>
            <span className="text-sm font-medium text-foreground">{formatARS(data.blue)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Brecha</span>
            <span className={`text-lg font-bold ${data.gap !== null && data.gap > 0 ? "text-negative" : "text-positive"}`}>
              {formatPercent(data.gap ?? 0)}
            </span>
          </div>
          {data.date && (
            <p className="text-xs text-muted-foreground">Actualizado: {data.date}</p>
          )}
        </div>
      )}
    </Card>
  );
}
