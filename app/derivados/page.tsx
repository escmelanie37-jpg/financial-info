"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/layout/navigation";
import { CotizacionesTable } from "@/components/derivados/CotizacionesTable";
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
import { Search, RefreshCw } from "lucide-react";
import type { MaeCotizacion } from "@/lib/services/mae";

interface DerivadosResponse {
  success: boolean;
  rentafija: MaeCotizacion[];
  cauciones: MaeCotizacion[];
  forex: MaeCotizacion[];
  rentafijaSource?: "live" | "reporte" | "fallback";
  fetchedAt?: string;
  env?: string;
}

export default function DerivadosPage() {
  const [data, setData] = useState<DerivadosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/derivados");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Error fetching derivados", e);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const sourceLabel =
    data?.rentafijaSource === "reporte"
      ? "Renta fija: cierre del último día hábil (mercado cerrado)"
      : data?.rentafijaSource === "fallback"
        ? "Renta fija: usando precios de respaldo (Yahoo Finance)"
        : "Datos en tiempo real vía A3 Mercados";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Derivados</h1>
            <p className="text-muted-foreground mt-1">
              Cotizaciones MAE — renta fija, cauciones y forex
            </p>
            {data?.fetchedAt && (
              <p className="text-xs text-muted-foreground mt-1">{sourceLabel}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar ticker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-56 rounded-xl bg-secondary border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Renta Fija"
            count={data?.rentafija.length ?? 0}
            loading={loading}
          />
          <StatCard
            label="Cauciones"
            count={data?.cauciones.length ?? 0}
            loading={loading}
          />
          <StatCard
            label="Forex"
            count={data?.forex.length ?? 0}
            loading={loading}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mercado MAE</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rentafija">
              <TabList className="flex flex-wrap gap-1 rounded-xl bg-secondary p-1 mb-6">
                <TabTrigger value="rentafija" className="rounded-lg data-[state=active]:bg-background px-3 py-1.5 text-sm">
                  Renta Fija
                </TabTrigger>
                <TabTrigger value="cauciones" className="rounded-lg data-[state=active]:bg-background px-3 py-1.5 text-sm">
                  Cauciones
                </TabTrigger>
                <TabTrigger value="forex" className="rounded-lg data-[state=active]:bg-background px-3 py-1.5 text-sm">
                  Forex
                </TabTrigger>
              </TabList>

              <TabContent value="rentafija">
                <CotizacionesTable
                  rows={data?.rentafija ?? []}
                  mode="rentafija"
                  loading={loading}
                  search={search}
                />
              </TabContent>
              <TabContent value="cauciones">
                <CotizacionesTable
                  rows={data?.cauciones ?? []}
                  mode="cauciones"
                  loading={loading}
                  search={search}
                />
              </TabContent>
              <TabContent value="forex">
                <CotizacionesTable
                  rows={data?.forex ?? []}
                  mode="forex"
                  loading={loading}
                  search={search}
                />
              </TabContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  label,
  count,
  loading,
}: {
  label: string;
  count: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">
        {loading ? "—" : count.toLocaleString("es-AR")}
      </p>
    </div>
  );
}
