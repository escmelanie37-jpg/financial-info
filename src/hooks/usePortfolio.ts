import { useState, useEffect, useCallback } from "react";

export interface Position {
  id: number;
  portfolioId: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  purchaseDate: number;
  createdAt: number;
}

export interface Portfolio {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
  positions?: Position[];
}

interface UsePortfolioReturn {
  portfolios: Portfolio[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (name: string, description?: string) => Promise<Portfolio | null>;
  remove: (id: number) => Promise<boolean>;
  addPosition: (
    portfolioId: number,
    symbol: string,
    quantity: number,
    averagePrice: number,
    purchaseDate: string
  ) => Promise<Position | null>;
  removePosition: (positionId: number) => Promise<boolean>;
}

export function usePortfolio(): UsePortfolioReturn {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Error al cargar portafolios");
      const data = await res.json();
      setPortfolios(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (name: string, description?: string) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Error al crear portafolio");
      const data = await res.json();
      setPortfolios((prev) => [...prev, data]);
      return data;
    } catch {
      return null;
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar portafolio");
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const addPosition = useCallback(async (
    portfolioId: number,
    symbol: string,
    quantity: number,
    averagePrice: number,
    purchaseDate: string
  ) => {
    try {
      const res = await fetch(`/api/portfolio/${portfolioId}/positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, quantity, averagePrice, purchaseDate }),
      });
      if (!res.ok) throw new Error("Error al agregar posición");
      const position = await res.json();
      await refresh();
      return position;
    } catch {
      return null;
    }
  }, [refresh]);

  const removePosition = useCallback(async (positionId: number) => {
    try {
      const res = await fetch(`/api/portfolio/${positionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar posición");
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [refresh]);

  return { portfolios, loading, error, refresh, create, remove, addPosition, removePosition };
}
