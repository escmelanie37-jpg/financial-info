"use client";

import { useEffect, useState, useMemo } from "react";
import Navigation from "@/components/layout/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabContent,
  TabList,
  TabTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { AVAILABLE_STOCKS } from "@/lib/stocks";

interface Stock {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  marketTime: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  marketCap: number | null;
}

interface TabDef {
  id: string;
  label: string;
  symbols: string[];
}

const TAB_DEFS: TabDef[] = [
  {
    id: "usa",
    label: "Estados Unidos",
    symbols: AVAILABLE_STOCKS.filter((s) => s.type === "stock" && s.market === "USA").map((s) => s.symbol),
  },
  {
    id: "argentina",
    label: "Argentina",
    symbols: AVAILABLE_STOCKS.filter((s) => s.type === "stock" && s.market === "ARG").map((s) => s.symbol),
  },
  {
    id: "crypto",
    label: "Cryptos",
    symbols: AVAILABLE_STOCKS.filter((s) => s.type === "crypto").map((s) => s.symbol),
  },
];

export default function MarketsPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchStocks() {
      try {
        const res = await fetch("/api/stocks");
        const data = await res.json();
        setStocks(data.data || []);
      } catch (e) {
        console.error("Error fetching stocks", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStocks();
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map<string, Stock>();
    for (const s of stocks) {
      map.set(s.symbol, s);
    }
    return map;
  }, [stocks]);

  const searchLower = search.toLowerCase();

  function formatPrice(price: number | null, currency: string | null): string {
    if (price === null) return "—";
    if (currency === "ARS") {
      return `$${price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: price < 10 ? 4 : 2,
      maximumFractionDigits: price < 10 ? 4 : 2,
    }).format(price);
  }

  function formatCompact(value: number | null): string {
    if (value === null) return "—";
    if (value >= 1e12) return (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
    if (value >= 1e3) return (value / 1e3).toFixed(1) + "K";
    return value.toString();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mercados</h1>
            <p className="text-muted-foreground mt-1">
              Cotizaciones en tiempo real de acciones, ETFs y criptos
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar símbolo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-64 rounded-xl bg-secondary border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activos financieros</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="usa">
              <TabList className="flex flex-wrap gap-1 rounded-xl bg-secondary p-1 mb-6">
                {TAB_DEFS.map((t) => (
                  <TabTrigger key={t.id} value={t.id} className="rounded-lg data-[state=active]:bg-background px-3 py-1.5 text-sm">
                    {t.label}
                  </TabTrigger>
                ))}
              </TabList>

              {TAB_DEFS.map((t) => {
                const symbolList = search
                  ? t.symbols.filter((sym) => sym.toLowerCase().includes(searchLower))
                  : t.symbols;
                const rows = symbolList.map((sym) => dataMap.get(sym) ?? {
                  symbol: sym,
                  price: null,
                  change: null,
                  changePercent: null,
                  currency: null,
                  marketTime: null,
                  dayHigh: null,
                  dayLow: null,
                  volume: null,
                  marketCap: null,
                });
                return (
                  <TabContent key={t.id} value={t.id}>
                    <StockTable
                      stocks={rows}
                      loading={loading}
                      formatPrice={formatPrice}
                      formatCompact={formatCompact}
                    />
                  </TabContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StockTable({
  stocks,
  loading,
  formatPrice,
  formatCompact,
}: {
  stocks: Stock[];
  loading: boolean;
  formatPrice: (p: number | null, c: string | null) => string;
  formatCompact: (v: number | null) => string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-muted-foreground font-medium">Símbolo</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Precio</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Cambio</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">%</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Máx</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Mín</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Volumen</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">M. Cap</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const isPositive = (stock.change ?? 0) >= 0;
            return (
              <tr
                key={stock.symbol}
                className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <td className="py-3 px-2">
                  <span className="font-semibold">{stock.symbol}</span>
                </td>
                <td className="text-right py-3 px-2 font-medium">
                  {formatPrice(stock.price, stock.currency)}
                </td>
                <td className="text-right py-3 px-2">
                  <span className={`inline-flex items-center gap-1 text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stock.change?.toFixed(2) ?? "—"}
                  </span>
                </td>
                <td className="text-right py-3 px-2 hidden sm:table-cell">
                  <span className={`text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive ? "+" : ""}{stock.changePercent?.toFixed(2) ?? "—"}%
                  </span>
                </td>
                <td className="text-right py-3 px-2 text-muted-foreground hidden md:table-cell">
                  {stock.dayHigh?.toFixed(2) ?? "—"}
                </td>
                <td className="text-right py-3 px-2 text-muted-foreground hidden md:table-cell">
                  {stock.dayLow?.toFixed(2) ?? "—"}
                </td>
                <td className="text-right py-3 px-2 text-muted-foreground hidden lg:table-cell">
                  {formatCompact(stock.volume)}
                </td>
                <td className="text-right py-3 px-2 text-muted-foreground hidden lg:table-cell">
                  {formatCompact(stock.marketCap)}
                </td>
              </tr>
            );
          })}
          {stocks.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-16 text-muted-foreground">
                No se encontraron resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
