"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatCompactCurrency } from "@/lib/utils/formatters";

interface ReservesData {
  amount: number | null;
  change: number | null;
  date: string | null;
}

export function ReservesCard() {
  const [data, setData] = useState<ReservesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/macro");
        if (!res.ok) throw new Error();
        const result = await res.json();
        setData(result.reserves ?? null);
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
      <h3 className="text-sm font-semibold text-foreground mb-3">Reservas BCRA</h3>
      {!data ? (
        <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
      ) : (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Reservas del Banco Central</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCompactCurrency(data.amount)}
          </p>
          {data.change !== null && (
            <p className={`text-sm mt-1 ${data.change >= 0 ? "text-positive" : "text-negative"}`}>
              {data.change >= 0 ? "+" : ""}
              {formatCompactCurrency(data.change)}
            </p>
          )}
          {data.date && (
            <p className="text-xs text-muted-foreground mt-2">Actualizado: {data.date}</p>
          )}
        </div>
      )}
    </Card>
  );
}
