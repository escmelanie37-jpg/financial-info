"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import type { MaeCotizacion } from "@/lib/services/mae";
import { findMaeQuoteForSymbol } from "@/lib/services/mae";

interface Bond {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  source: "yahoo" | "mae";
}

const BOND_SYMBOLS = ["AL30D.BA", "GD30D.BA", "AE38D.BA"];

const bondNames: Record<string, string> = {
  "AL30D.BA": "AL30 USD",
  "GD30D.BA": "GD30 USD",
  "AE38D.BA": "AE38 USD",
};

function findMaeQuote(quotes: MaeCotizacion[], symbol: string): MaeCotizacion | undefined {
  return findMaeQuoteForSymbol(symbol, quotes);
}

export function BondTable() {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stocksRes, derivadosRes] = await Promise.all([
          fetch("/api/stocks"),
          fetch("/api/derivados"),
        ]);

        const stocksData = stocksRes.ok ? await stocksRes.json() : { data: [] };
        const derivadosData = derivadosRes.ok ? await derivadosRes.json() : { bonosMae: [] };
        const all: { symbol: string; price?: number; changePercent?: number }[] =
          stocksData.data ?? [];
        const maeQuotes: MaeCotizacion[] = derivadosData.bonosMae ?? derivadosData.rentafija ?? [];

        const bondData = BOND_SYMBOLS.map((symbol) => {
          const yahoo = all.find((s) => s.symbol === symbol);
          const mae = findMaeQuote(maeQuotes, symbol);
          const maePrice = mae?.precioUltimo || mae?.precioCierre || null;

          if (yahoo?.price != null) {
            return {
              symbol,
              name: bondNames[symbol] ?? symbol,
              price: yahoo.price,
              changePercent: yahoo.changePercent ?? null,
              source: "yahoo" as const,
            };
          }

          if (maePrice != null) {
            return {
              symbol,
              name: bondNames[symbol] ?? symbol,
              price: maePrice,
              changePercent: mae?.variacion ?? null,
              source: "mae" as const,
            };
          }

          return {
            symbol,
            name: bondNames[symbol] ?? symbol,
            price: null,
            changePercent: null,
            source: "yahoo" as const,
          };
        });

        setBonds(bondData);
      } catch {
        setBonds([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Bono</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Precio</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Cambio</th>
          </tr>
        </thead>
        <tbody>
          {bonds.map((bond) => (
            <tr key={bond.symbol} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-2 px-2">
                <span className="font-medium text-foreground">{bond.name}</span>
                {bond.source === "mae" && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground">MAE</span>
                )}
              </td>
              <td className="py-2 px-2 text-right text-foreground">
                {formatCurrency(bond.price, bond.price != null && bond.price < 10 ? 4 : 2)}
              </td>
              <td className={`py-2 px-2 text-right ${bond.changePercent !== null && bond.changePercent >= 0 ? "text-positive" : "text-negative"}`}>
                {formatPercent(bond.changePercent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
