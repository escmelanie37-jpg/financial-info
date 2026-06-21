"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/layout/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarMarketCard } from "@/components/dashboard/DollarMarketCard";
import { GlobalIndicesCard } from "@/components/dashboard/GlobalIndicesCard";
import { NewsFeedCard } from "@/components/dashboard/NewsFeedCard";
import Link from "next/link";
import {
  TrendingUp,
  Activity,
  Target,
  Wallet,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AllocationPieChart3D,
  getAllocationColor,
} from "@/components/portfolio/AllocationPieChart3D";

interface StockQuote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  marketCap: number | null;
}

interface DashboardData {
  authenticated: boolean;
  marketStocks: StockQuote[];
  stats?: {
    valorTotal: number;
    rendimientoMensual: number;
    riesgoTotal: string;
    activos: number;
  };
  allocation?: { label: string; value: number }[];
  recentActivity?: { type: string; symbol: string; amount: string; time: string }[];
  historicalPerformance?: { month: string; value: number }[];
}

const statCards = [
  {
    key: "valorTotal",
    title: "Valor Total",
    icon: Wallet,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    key: "rendimientoMensual",
    title: "Rendimiento Mensual",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    key: "activos",
    title: "Activos",
    icon: Target,
    gradient: "from-blue-500 to-indigo-500",
  },
];

const barGradients = [
  "from-purple-500 to-purple-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-blue-500 to-blue-600",
  "from-pink-500 to-pink-600",
  "from-cyan-500 to-cyan-600",
];

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();
  
  // Monday to Friday (1-5) and 10am to 5pm (10-17)
  return day >= 1 && day <= 5 && hour >= 10 && hour < 17;
}

function renderStatValue(key: string, value: unknown): { display: string; isPositive?: boolean } {
  switch (key) {
    case "valorTotal":
      return { display: formatCurrency(value as number) };
    case "rendimientoMensual": {
      const v = value as number;
      return {
        display: `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
        isPositive: v >= 0,
      };
    }
    case "activos":
      return { display: (value as number).toString() };
    default:
      return { display: String(value) };
  }
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Error fetching dashboard", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => setLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  const isAuth = data?.authenticated && data?.stats;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAuth
                ? "Resumen de tu portafolio financiero"
                : "Visión general de mercados"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs ${
              isMarketOpen() ? "text-emerald-400" : "text-red-400"
            }`}>
              <span className={`flex h-2 w-2 rounded-full ${
                isMarketOpen() ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`} />
              {isMarketOpen() ? "Mercado Abierto" : "Mercado Cerrado"}
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando...</span>
            </div>
          </div>
        )}

        {!loading && data && (
          <>
            {isAuth && data.stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  const value = data.stats![card.key as keyof typeof data.stats];
                  const { display, isPositive } = renderStatValue(card.key, value);
                  return (
                    <Card
                      key={card.key}
                      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                    >
                      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${card.gradient}`} />
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {card.title}
                        </CardTitle>
                        <div className={`rounded-lg bg-gradient-to-br ${card.gradient} p-2 text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline justify-between">
                          <span
                            className={`text-2xl font-bold ${
                              card.key === "rendimientoMensual"
                                ? isPositive
                                  ? "text-emerald-400"
                                  : "text-red-400"
                                : ""
                            }`}
                          >
                            {display}
                          </span>
                          {card.key === "rendimientoMensual" && (
                            <span
                              className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                                isPositive ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#4A5568]">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Visión General de Mercados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.marketStocks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No hay datos de mercado disponibles. Visitá la página de Mercados para actualizar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.marketStocks.map((stock) => {
                      const isPositive = (stock.change ?? 0) >= 0;
                      const changeStr = stock.changePercent !== null
                        ? `${isPositive ? "+" : ""}${stock.changePercent.toFixed(2)}%`
                        : "—";
                      const priceStr = stock.price !== null
                        ? formatCurrency(stock.price)
                        : "—";
                      return (
                        <div
                          key={stock.symbol}
                          className="p-4 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{stock.symbol}</span>
                            <span
                              className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                                isPositive
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {changeStr}
                            </span>
                          </div>
                          <p className="text-lg font-semibold">{priceStr}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <DollarMarketCard />
              <GlobalIndicesCard />
              <NewsFeedCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#4A5568]">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Acciones Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link
                      href="/markets"
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/20 transition-all group"
                    >
                      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2 text-white transition-transform group-hover:scale-110">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Ver Mercados</span>
                    </Link>
                    <Link
                      href={isAuth ? "/portfolio" : "/sign-in"}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/20 transition-all group"
                    >
                      <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 text-white transition-transform group-hover:scale-110">
                        <PieChart className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Mi Portafolio</span>
                    </Link>
                    <Link
                      href="/analysis"
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/20 transition-all group"
                    >
                      <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2 text-white transition-transform group-hover:scale-110">
                        <Activity className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Análisis</span>
                    </Link>
                  </CardContent>
                </Card>

                {isAuth && data.recentActivity && data.recentActivity.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#4A5568]">
                        <Clock className="h-5 w-5 text-primary" />
                        Actividad Reciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {data.recentActivity.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg p-2 bg-emerald-500/10 text-emerald-400">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-emerald-400">
                                {item.type}
                              </span>
                              <p className="text-xs text-muted-foreground">{item.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.amount}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

                  {isAuth && (
                    <div className="lg:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-[#4A5568]">
                            <PieChart className="h-5 w-5 text-primary" />
                            Análisis de Portafolio
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="w-full h-72 relative rounded-lg p-2">
                            {data.allocation && data.allocation.length > 0 ? (
                              <AllocationPieChart3D data={data.allocation} />
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                No hay posiciones en tu portafolio
                              </div>
                            )}
                          </div>
                          {data.allocation && data.allocation.length > 0 && (
                            <div className="mt-6 space-y-3">
                              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Desglose Detallado
                              </h4>
                              {data.allocation.map((alloc, i) => (
                                <div key={alloc.label} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: getAllocationColor(i) }}
                                    />
                                    <span className="text-sm font-medium">{alloc.label}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {alloc.value}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {data.historicalPerformance && data.historicalPerformance.length > 0 && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-[#4A5568]">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Capital Invertido
                              </CardTitle>
                              {data.stats && (
                                <span
                                  className={`text-sm font-medium ${
                                    data.stats.rendimientoMensual >= 0
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {data.stats.rendimientoMensual >= 0 ? "+" : ""}
                                  {data.stats.rendimientoMensual.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.historicalPerformance}>
                                  <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--border))"
                                    vertical={false}
                                  />
                                  <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                  />
                                  <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "hsl(var(--card))",
                                      border: "1px solid hsl(var(--border))",
                                      borderRadius: "12px",
                                      color: "hsl(var(--foreground))",
                                    }}
                                    formatter={(value) => [
                                      `$${Number(value).toLocaleString("en-US")}`,
                                      "Capital",
                                    ]}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fill="url(#chartGradient)"
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
            </div>
          </>
        )}

        {!loading && !data && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            Error al cargar los datos
          </div>
        )}
      </main>
    </div>
  );
}
