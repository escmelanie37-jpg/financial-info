const BASE_URL = "https://dolarapi.com/v1";

export interface DolarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface DolarResponse {
  oficial: DolarRate | null;
  blue: DolarRate | null;
  bolsa: DolarRate | null;
  ccl: DolarRate | null;
  mayorista: DolarRate | null;
  cripto: DolarRate | null;
  tarjeta: DolarRate | null;
  all: DolarRate[];
  lastUpdated: string | null;
}

function parseRates(data: DolarRate[]): DolarResponse {
  const find = (casa: string) => data.find((r) => r.casa === casa) ?? null;
  return {
    oficial: find("oficial"),
    blue: find("blue"),
    bolsa: find("bolsa"),
    ccl: find("contadoconliqui"),
    mayorista: find("mayorista"),
    cripto: find("cripto"),
    tarjeta: find("tarjeta"),
    all: data,
    lastUpdated: data.length > 0 ? data[0].fechaActualizacion : null,
  };
}

export async function fetchDolarRates(): Promise<DolarResponse> {
  const res = await fetch(`${BASE_URL}/dolares`);
  if (!res.ok) throw new Error(`DolarAPI error: ${res.status}`);
  const data: DolarRate[] = await res.json();
  return parseRates(data);
}

export async function fetchDolarRate(casa: string): Promise<DolarRate | null> {
  const res = await fetch(`${BASE_URL}/dolares`);
  if (!res.ok) throw new Error(`DolarAPI error: ${res.status}`);
  const data: DolarRate[] = await res.json();
  return data.find((r) => r.casa === casa) ?? null;
}

export function calculateGap(rate1: number, rate2: number): number {
  if (rate2 === 0) return 0;
  return ((rate1 - rate2) / rate2) * 100;
}
