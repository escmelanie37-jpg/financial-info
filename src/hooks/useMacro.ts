import { useState, useEffect, useCallback } from "react";

export interface InflationData {
  monthly: number | null;
  ytd: number | null;
  yearly: number | null;
  lastUpdate: string | null;
}

export interface ReservesData {
  amount: number | null;
  change: number | null;
  date: string | null;
}

export interface FXGapData {
  official: number | null;
  blue: number | null;
  gap: number | null;
  date: string | null;
}

interface UseMacroReturn {
  inflation: InflationData | null;
  reserves: ReservesData | null;
  fxGap: FXGapData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMacro(): UseMacroReturn {
  const [inflation, setInflation] = useState<InflationData | null>(null);
  const [reserves, setReserves] = useState<ReservesData | null>(null);
  const [fxGap, setFxGap] = useState<FXGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/macro");
      if (!res.ok) throw new Error("Error al cargar datos macro");
      const result = await res.json();
      setInflation(result.inflation ?? null);
      setReserves(result.reserves ?? null);
      setFxGap(result.fxGap ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { inflation, reserves, fxGap, loading, error, refresh };
}
