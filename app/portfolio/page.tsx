"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/layout/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AVAILABLE_STOCKS, ASSET_GROUPS } from "@/lib/stocks";
import {
  Plus,
  Trash2,
  Briefcase,
  Target,
  AlertCircle,
} from "lucide-react";

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
  createdAt: number;
  positions: Position[];
}

interface PriceMap {
  [symbol: string]: { price: number; change: number; changePercent: number };
}

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [posSymbol, setPosSymbol] = useState("");
  const [posQty, setPosQty] = useState("");
  const [posPrice, setPosPrice] = useState("");
  const [posDate, setPosDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [prices, setPrices] = useState<PriceMap>({});

  async function fetchPortfolios() {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) setPortfolios(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPrices() {
    try {
      const res = await fetch("/api/stocks");
      if (res.ok) {
        const data = await res.json();
        const map: PriceMap = {};
        (data.data || []).forEach((s: any) => {
          map[s.symbol] = { price: s.price, change: s.change, changePercent: s.changePercent };
        });
        setPrices(map);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchPortfolios();
    fetchPrices();
  }, []);

  async function createPortfolio() {
    if (!newName.trim()) return;
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    if (res.ok) {
      setNewName("");
      setNewDesc("");
      setShowForm(false);
      fetchPortfolios();
    }
  }

  async function deletePortfolio(id: number) {
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedPortfolio(null);
      fetchPortfolios();
    }
  }

  async function addPosition() {
    setError("");
    if (!selectedPortfolio || !posSymbol || !posQty || !posPrice || !posDate) {
      setError("Completá todos los campos");
      return;
    }
    const res = await fetch(`/api/portfolio/${selectedPortfolio.id}/positions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: posSymbol,
        quantity: posQty,
        averagePrice: posPrice,
        purchaseDate: posDate,
      }),
    });
    if (res.ok) {
      setPosSymbol("");
      setPosQty("");
      setPosPrice("");
      setPosDate(new Date().toISOString().split("T")[0]);
      setShowAddPosition(false);
      const updated = await fetch(`/api/portfolio/${selectedPortfolio.id}`);
      if (updated.ok) setSelectedPortfolio(await updated.json());
    } else {
      const err = await res.json();
      setError(err.error || "Error al agregar posición");
    }
  }

  async function deletePosition(positionId: number) {
    if (!selectedPortfolio) return;
    const res = await fetch(`/api/portfolio/${selectedPortfolio.id}/positions/${positionId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const updated = await fetch(`/api/portfolio/${selectedPortfolio.id}`);
      if (updated.ok) setSelectedPortfolio(await updated.json());
    }
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Portafolio</h1>
            <p className="text-muted-foreground mt-1">Gestioná tus inversiones</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Portafolio
          </button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Nombre del portafolio"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 h-10 rounded-xl bg-secondary border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="flex-1 h-10 rounded-xl bg-secondary border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={createPortfolio}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Crear
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mis Portafolios</h2>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Cargando...
              </div>
            ) : portfolios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Briefcase className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No tenés portafolios aún</p>
                <p className="text-xs">Crea uno para empezar</p>
              </div>
            ) : (
              portfolios.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPortfolio(p)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedPortfolio?.id === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                      )}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePortfolio(p.id);
                      }}
                      className="cursor-pointer p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{p.positions?.length || 0} posiciones</span>
                    <span>Creado {formatDate(p.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedPortfolio ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedPortfolio.name}</CardTitle>
                    <button
                      onClick={() => setShowAddPosition(!showAddPosition)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddPosition && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4 p-3 rounded-xl bg-secondary/50 border border-border">
                      <select
                        value={posSymbol}
                        onChange={(e) => setPosSymbol(e.target.value)}
                        className="h-9 flex-1 rounded-lg bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Seleccionar símbolo</option>
                        {ASSET_GROUPS.map((group) => {
                          const assets = AVAILABLE_STOCKS.filter(group.filter);
                          if (assets.length === 0) return null;
                          return (
                            <optgroup key={group.label} label={group.label}>
                              {assets.map((s) => (
                                <option key={s.symbol} value={s.symbol}>
                                  {s.symbol} — {s.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={posQty}
                        onChange={(e) => setPosQty(e.target.value)}
                        className="h-9 w-24 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Precio compra"
                        value={posPrice}
                        onChange={(e) => setPosPrice(e.target.value)}
                        className="h-9 w-28 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="date"
                        value={posDate}
                        onChange={(e) => setPosDate(e.target.value)}
                        className="h-9 w-36 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={addPosition}
                        className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {selectedPortfolio.positions?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Target className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No hay posiciones</p>
                      <p className="text-xs">Agregá tu primera inversión</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium">Símbolo</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Cantidad</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Precio Compra</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium">Inversión</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Precio Actual</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Gan./Pér.</th>
                            <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Fecha</th>
                            <th className="py-3 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPortfolio.positions.map((pos) => {
                            const total = pos.quantity * pos.averagePrice;
                            const currentPrice = prices[pos.symbol]?.price ?? null;
                            const currentValue = currentPrice !== null ? pos.quantity * currentPrice : null;
                            const pnl = currentValue !== null ? currentValue - total : null;
                            const pnlPct = pnl !== null && total > 0 ? (pnl / total) * 100 : null;
                            return (
                              <tr key={pos.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                                <td className="py-3 px-2 font-semibold">{pos.symbol}</td>
                                <td className="text-right py-3 px-2">{pos.quantity}</td>
                                <td className="text-right py-3 px-2">
                                  ${pos.averagePrice.toFixed(2)}
                                </td>
                                <td className="text-right py-3 px-2 font-medium">
                                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </td>
                                <td className="text-right py-3 px-2 hidden sm:table-cell">
                                  {currentPrice !== null
                                    ? `$${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                    : "—"
                                  }
                                </td>
                                <td className="text-right py-3 px-2 hidden sm:table-cell">
                                  {pnl !== null ? (
                                    <span className={pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                                      {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                      {pnlPct !== null && (
                                        <span className="text-xs ml-1">
                                          ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                                        </span>
                                      )}
                                    </span>
                                  ) : "—"}
                                </td>
                                <td className="text-right py-3 px-2 text-muted-foreground hidden sm:table-cell">
                                  {formatDate(pos.purchaseDate)}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <button
                                    onClick={() => deletePosition(pos.id)}
                                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Briefcase className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">Seleccioná un portafolio</p>
                <p className="text-sm">Elegí uno de la izquierda o creá uno nuevo</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
