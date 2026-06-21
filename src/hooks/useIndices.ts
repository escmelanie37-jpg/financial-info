import { useState, useEffect, useCallback } from "react";

export interface IndexData {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

interface UseIndicesReturn {
  indices: IndexData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIndices(): UseIndicesReturn {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/indices");
      if (!res.ok) throw new Error("Error al cargar índices");
      const result = await res.json();
      setIndices(result.data ?? result.indices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIndices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { indices, loading, error, refresh };
}
