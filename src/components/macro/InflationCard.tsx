"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/formatters";

interface InflationSummary {
  monthly: number | null;
  ytd: number | null;
  yearly: number | null;
  lastUpdate: string | null;
}

export function InflationCard() {
  const [data, setData] = useState<InflationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/macro");
        if (!res.ok) throw new Error();
        const result = await res.json();
        setData(result.inflation ?? null);
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
      <h3 className="text-sm font-semibold text-foreground mb-3">Inflación (IPC)</h3>
      {!data ? (
        <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Mensual</p>
            <p className="text-lg font-bold text-negative">{formatPercent(data.monthly ?? 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Acumulado Año</p>
            <p className="text-lg font-bold text-negative">{formatPercent(data.ytd ?? 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Último Año</p>
            <p className="text-lg font-bold text-negative">{formatPercent(data.yearly ?? 0)}</p>
          </div>
        </div>
      )}
      {data?.lastUpdate && (
        <p className="text-xs text-muted-foreground mt-2">Actualizado: {data.lastUpdate}</p>
      )}
    </Card>
  );
}
