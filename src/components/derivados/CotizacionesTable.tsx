"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { MaeCotizacion } from "@/lib/services/mae";
import { formatCompactNumber, formatPercent } from "@/lib/utils/formatters";

type TableMode = "rentafija" | "cauciones" | "forex";

interface CotizacionesTableProps {
  rows: MaeCotizacion[];
  mode: TableMode;
  loading?: boolean;
  search?: string;
}

function formatMaeMoneda(moneda: string): string {
  switch (moneda) {
    case "$":
      return "ARS";
    case "D":
      return "USD";
    case "T":
      return "ARS";
    default:
      return moneda;
  }
}

function formatPrice(value: number | null | undefined, moneda: string, mode: TableMode): string {
  if (value === null || value === undefined || value === 0) return "—";
  const currency = formatMaeMoneda(moneda);
  if (mode === "cauciones") {
    return `${value.toFixed(2)}%`;
  }
  if (currency === "USD" && value < 10) {
    return `USD ${value.toFixed(4)}`;
  }
  if (currency === "ARS") {
    return `$${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function formatPlazo(plazo: string): string {
  if (!plazo || plazo === "000") return "CI";
  const days = parseInt(plazo, 10);
  return Number.isNaN(days) ? plazo : `${days}d`;
}

export function CotizacionesTable({ rows, mode, loading, search = "" }: CotizacionesTableProps) {
  const searchLower = search.toLowerCase();
  const filtered = rows.filter(
    (r) =>
      r.ticker.toLowerCase().includes(searchLower) ||
      r.descripcion.toLowerCase().includes(searchLower)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Cargando cotizaciones...
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {rows.length === 0
          ? "Sin datos disponibles. El mercado puede estar cerrado."
          : "No se encontraron resultados"}
      </div>
    );
  }

  const showTasa = mode === "cauciones";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-muted-foreground font-medium">Ticker</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">
              Descripción
            </th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">Plazo</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">Moneda</th>
            {showTasa ? (
              <th className="text-right py-3 px-2 text-muted-foreground font-medium">Tasa</th>
            ) : (
              <th className="text-right py-3 px-2 text-muted-foreground font-medium">Último</th>
            )}
            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Var %</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">
              Volumen
            </th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden xl:table-cell">
              Monto
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => {
            const isPositive = row.variacion >= 0;
            const displayPrice = showTasa
              ? row.ultimaTasa || row.precioCierre
              : row.precioUltimo || row.precioCierre;

            return (
              <tr
                key={`${row.ticker}-${row.plazo}-${row.moneda}-${row.codigoSegmento}-${i}`}
                className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <td className="py-3 px-2">
                  <span className="font-semibold">{row.ticker}</span>
                  {row.segmento && (
                    <span className="block text-xs text-muted-foreground truncate max-w-[120px]">
                      {row.segmento}
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-muted-foreground hidden md:table-cell max-w-[240px] truncate">
                  {row.descripcion}
                </td>
                <td className="py-3 px-2 text-center text-muted-foreground">
                  {formatPlazo(row.plazo)}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-secondary">
                    {formatMaeMoneda(row.moneda)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right font-medium">
                  {formatPrice(displayPrice, row.moneda, mode)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={`inline-flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {row.variacion !== 0 && (
                      isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )
                    )}
                    {formatPercent(row.variacion)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-muted-foreground hidden lg:table-cell">
                  {formatCompactNumber(row.volumenAcumulado)}
                </td>
                <td className="py-3 px-2 text-right text-muted-foreground hidden xl:table-cell">
                  {formatCompactNumber(row.montoAcumulado)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
