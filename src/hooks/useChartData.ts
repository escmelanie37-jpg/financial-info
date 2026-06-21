import { useState, useEffect, useCallback } from "react";

export interface ChartDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface UseChartDataReturn {
  data: ChartDataPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useChartData(
  symbol: string | null,
  timeframe: string = "1M"
): UseChartDataReturn {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!symbol) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/charts/${symbol}?timeframe=${timeframe}`);
      if (!res.ok) throw new Error("Error al cargar datos del gráfico");
      const result = await res.json();
      const points: ChartDataPoint[] = (result.data ?? result ?? []).map((p: any) => ({
        date: new Date(p.date ?? p.timestamp),
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume,
      }));
      setData(points);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
