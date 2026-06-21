"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatARS, formatPercent } from "@/lib/utils/formatters";

interface DolarRate {
  nombre: string;
  compra: number;
  venta: number;
}

export function DollarMarketCard() {
  const [rates, setRates] = useState<DolarRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://dolarapi.com/v1/dolares");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRates(
          data.map((r: any) => ({
            nombre: r.nombre,
            compra: r.compra,
            venta: r.venta,
          }))
        );
      } catch {
        setRates([]);
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Dólar Hoy</h3>
        <Badge variant="outline" className="text-xs">AR$</Badge>
      </div>
      <div className="space-y-2">
        {rates.map((rate) => (
          <div
            key={rate.nombre}
            className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
          >
            <span className="text-sm text-muted-foreground">{rate.nombre}</span>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {formatARS(rate.venta)}
              </p>
              <p className="text-xs text-muted-foreground">
                Compra: {formatARS(rate.compra)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
