const BASE_URL = "https://api.argentinadatos.com/v1";
const BCRA_API = "https://api.bcra.gob.ar/estadisticas/v4.0";

export interface InflationPoint {
  fecha: string;
  valor: number;
}

export async function fetchInflation(): Promise<InflationPoint[]> {
  const res = await fetch(`${BASE_URL}/finanzas/indices/inflacion`);
  if (!res.ok) throw new Error(`Inflation API error: ${res.status}`);
  return res.json();
}

export async function fetchLatestInflation(): Promise<InflationPoint | null> {
  const data = await fetchInflation();
  return data.length > 0 ? data[data.length - 1] : null;
}

export interface InflationSummary {
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

export async function fetchReserves(): Promise<ReservesData> {
  try {
    // Intentar primero con ArgentinaDatos
    const res = await fetch(`${BASE_URL}/finanzas/reservas_internacionales`, {
      next: { revalidate: 3600 }, // Cache por 1 hora
    });
    if (!res.ok) throw new Error(`Reserves API error: ${res.status}`);
    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return { amount: null, change: null, date: null };
    }
    
    // Obtener el dato más reciente
    const lastEntry = data[data.length - 1];
    const previousEntry = data.length > 1 ? data[data.length - 2] : null;
    
    const change = previousEntry 
      ? (lastEntry.valor || 0) - (previousEntry.valor || 0)
      : null;
    
    return {
      amount: lastEntry.valor ?? null,
      change,
      date: lastEntry.fecha ?? null,
    };
  } catch (error) {
    console.error("Error fetching reserves from ArgentinaDatos:", error);
    
    // Fallback a BCRA API
    try {
      const res = await fetch(`${BCRA_API}/Monetarias/1`, {
        headers: { "User-Agent": "financial-info/1.0" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error(`BCRA API error: ${res.status}`);
      const json = await res.json();
      const results = json.results ?? [];
      const first = results[0];
      if (!first?.detalle?.length) return { amount: null, change: null, date: null };
      const lastEntry = first.detalle[first.detalle.length - 1];
      return {
        amount: lastEntry.valor ?? null,
        change: null,
        date: lastEntry.fecha ?? null,
      };
    } catch (bcraError) {
      console.error("Error fetching reserves from BCRA:", bcraError);
      return { amount: null, change: null, date: null };
    }
  }
}

export async function fetchInflationSummary(): Promise<InflationSummary> {
  const data = await fetchInflation();
  if (data.length === 0) {
    return { monthly: null, ytd: null, yearly: null, lastUpdate: null };
  }

  const last = data[data.length - 1];
  const lastDate = new Date(last.fecha);

  const currentYear = lastDate.getFullYear();
  const yearData = data.filter((d) => new Date(d.fecha).getFullYear() === currentYear);
  const ytd = yearData.reduce((sum, d) => sum + d.valor, 0);

  const lastYear = currentYear - 1;
  const yearAgoData = data.filter(
    (d) => new Date(d.fecha).getFullYear() === lastYear
  );
  const yearly = yearAgoData.reduce((sum, d) => sum + d.valor, 0);

  return {
    monthly: last.valor,
    ytd: Math.round(ytd * 100) / 100,
    yearly: Math.round(yearly * 100) / 100,
    lastUpdate: last.fecha,
  };
}
