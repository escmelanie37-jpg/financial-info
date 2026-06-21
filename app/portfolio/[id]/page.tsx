"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionTable } from "@/components/portfolio/PositionTable";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { ArrowLeft, Loader2, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Position {
  id: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  purchaseDate: number;
}

interface Portfolio {
  id: number;
  name: string;
  description: string | null;
  positions: Position[];
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/portfolio/${params.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPortfolio(data);
      } catch {
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  useEffect(() => {
    if (!portfolio?.positions.length) return;
    async function loadPrices() {
      try {
        const res = await fetch("/api/stocks");
        if (!res.ok) throw new Error();
        const json = await res.json();
        const map: Record<string, number> = {};
        (json.data ?? []).forEach((s: any) => {
          if (s.price) map[s.symbol] = s.price;
        });
        setPrices(map);
      } catch {}
    }
    loadPrices();
  }, [portfolio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-muted-foreground">Portafolio no encontrado</p>
        </main>
      </div>
    );
  }

  const positionsWithPrices = portfolio.positions.map((pos) => ({
    ...pos,
    price: prices[pos.symbol] ?? null,
  }));

  const totalValue = positionsWithPrices.reduce(
    (sum, pos) => sum + pos.quantity * (pos.price ?? pos.averagePrice),
    0
  );
  const totalCost = positionsWithPrices.reduce(
    (sum, pos) => sum + pos.quantity * pos.averagePrice,
    0
  );
  const pnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

  const allocation = positionsWithPrices.map((pos) => ({
    label: pos.symbol,
    value: totalValue > 0 ? Math.round(((pos.quantity * (pos.price ?? pos.averagePrice)) / totalValue) * 100) : 0,
  }));

  const sortedPositions = [...portfolio.positions].sort((a, b) => a.purchaseDate - b.purchaseDate);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthlyGroups: Record<string, number> = {};
  sortedPositions.forEach((pos) => {
    const d = new Date(pos.purchaseDate);
    const key = `${months[d.getMonth()]}${d.getFullYear().toString().slice(-2)}`;
    monthlyGroups[key] = (monthlyGroups[key] || 0) + pos.quantity * pos.averagePrice;
  });
  let cumulative = 0;
  const historicalPerformance = Object.entries(monthlyGroups).map(([month, cost]) => {
    cumulative += cost;
    return { month, value: cumulative };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/portfolio")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="text-muted-foreground mt-1">{portfolio.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
            <p className={`text-sm font-medium ${pnl >= 0 ? "text-positive" : "text-negative"}`}>
              {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Posiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <PositionTable positions={positionsWithPrices} />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Asignación</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationChart data={allocation} />
              </CardContent>
            </Card>
          </div>
        </div>

        {historicalPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Capital Invertido
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalPerformance}>
                    <defs>
                      <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }}
                      formatter={(value) => [formatCurrency(value as number), "Capital"]} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#perfGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
