import { useState, useEffect, useCallback } from "react";

export interface WatchlistAsset {
  id: number;
  watchlistId: number;
  symbol: string;
  createdAt: number;
}

export interface Watchlist {
  id: number;
  userId: number;
  name: string;
  createdAt: number;
  assets?: WatchlistAsset[];
}

interface UseWatchlistReturn {
  watchlists: Watchlist[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (name: string) => Promise<Watchlist | null>;
  remove: (id: number) => Promise<boolean>;
  addAsset: (watchlistId: number, symbol: string) => Promise<boolean>;
  removeAsset: (watchlistId: number, symbol: string) => Promise<boolean>;
}

export function useWatchlist(): UseWatchlistReturn {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/watchlists");
      if (!res.ok) throw new Error("Error al cargar watchlists");
      const data = await res.json();
      setWatchlists(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Error al crear watchlist");
      const data = await res.json();
      setWatchlists((prev) => [...prev, data]);
      return data;
    } catch {
      return null;
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/watchlists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar watchlist");
      setWatchlists((prev) => prev.filter((w) => w.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const addAsset = useCallback(async (watchlistId: number, symbol: string) => {
    try {
      const res = await fetch(`/api/watchlists/${watchlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", symbol }),
      });
      if (!res.ok) throw new Error("Error al agregar activo");
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [refresh]);

  const removeAsset = useCallback(async (watchlistId: number, symbol: string) => {
    try {
      const res = await fetch(`/api/watchlists/${watchlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", symbol }),
      });
      if (!res.ok) throw new Error("Error al eliminar activo");
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [refresh]);

  return { watchlists, loading, error, refresh, create, remove, addAsset, removeAsset };
}
