"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/formatters";

interface Index {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
}

export function GlobalIndicesCard() {
  const [indices, setIndices] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/indices");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setIndices(data.data ?? data.indices ?? []);
      } catch {
        setIndices([]);
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Índices Globales
      </h3>
      <div className="space-y-2">
        {indices.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
        )}
        {indices.map((idx) => (
          <div
            key={idx.symbol}
            className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{idx.symbol.replace(/^\^/, "")}</p>
              <p className="text-xs text-muted-foreground">{idx.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {idx.price?.toFixed(2) ?? "—"}
              </p>
              {idx.changePercent !== null && (
                <p
                  className={`text-xs ${
                    idx.changePercent >= 0 ? "text-positive" : "text-negative"
                  }`}
                >
                  {formatPercent(idx.changePercent)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
