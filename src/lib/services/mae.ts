import { AVAILABLE_STOCKS } from "@/lib/stocks";
import { fetchQuotes } from "@/lib/services/yahooFinance";

const PROD_BASE = "https://api.mae.com.ar/MarketData/v1";
const UAT_BASE = "https://apiuat.mae.com.ar/MarketData/v1";

export interface MaeCotizacion {
  fecha: string;
  ticker: string;
  descripcion: string;
  tipoEmision: string;
  segmento: string | null;
  codigoSegmento: string;
  plazo: string;
  codigoPlazo: string | null;
  moneda: string;
  fechaLiquidacion: string;
  volumenAcumulado: number;
  montoAcumulado: number;
  precioUltimo: number;
  ultimaTasa: number;
  precioCierreAnterior: number;
  precioMinimo: number;
  precioMaximo: number;
  openInterest: number;
  precioCierre: number | null;
  variacion: number;
}

interface MaeReporteTitulo {
  fecha: string;
  ticker: string;
  cupon: string;
  plazo: string;
  monedaCodigo: string;
  cantidad: number;
  monto: number;
  precioPromedioPonderado: number;
  precioCierreAyer: number;
  precioCierreHoy: number;
  precioUltimo: number;
  variacion: number;
  precioMinimo: number;
  precioMaximo: number;
}

interface MaeReporteSegmento {
  segmentoCodigo: string;
  titulos: MaeReporteTitulo[];
}

interface MaeReporteResumen {
  fecha: string;
  segmento: MaeReporteSegmento[];
}

function getMaeConfig() {
  const useUat = process.env.MAE_USE_UAT === "true";
  return {
    baseUrl: useUat ? UAT_BASE : PROD_BASE,
    apiKey: useUat ? process.env.API_KEY_UAT : process.env.API_KEY_PRODUCTION,
    env: useUat ? "uat" : "production",
  };
}

function hasMaeApiKey(): boolean {
  return Boolean(getMaeConfig().apiKey);
}

async function maeFetch<T>(path: string): Promise<T> {
  const { baseUrl, apiKey } = getMaeConfig();
  if (!apiKey) throw new Error("MAE API key not configured");

  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "x-api-key": apiKey },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`MAE API error: ${res.status} ${path}`);
  return res.json();
}

function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getPreviousBusinessDay(from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function reportTituloToCotizacion(t: MaeReporteTitulo): MaeCotizacion {
  return {
    fecha: t.fecha,
    ticker: t.ticker,
    descripcion: t.ticker,
    tipoEmision: "TPN",
    segmento: null,
    codigoSegmento: "",
    plazo: t.plazo,
    codigoPlazo: t.plazo,
    moneda: t.monedaCodigo,
    fechaLiquidacion: t.fecha,
    volumenAcumulado: t.cantidad,
    montoAcumulado: t.monto,
    precioUltimo: t.precioUltimo,
    ultimaTasa: 0,
    precioCierreAnterior: t.precioCierreAyer,
    precioMinimo: t.precioMinimo,
    precioMaximo: t.precioMaximo,
    openInterest: 0,
    precioCierre: t.precioCierreHoy,
    variacion: t.variacion,
  };
}

function buildFallbackMaeCotizacion(
  symbol: string,
  quote: {
    price: number | null;
    change: number | null;
    changePercent: number | null;
    currency: string | null;
    marketTime: number | null;
    dayHigh: number | null;
    dayLow: number | null;
    volume: number | null;
  }
): MaeCotizacion {
  const normalizedTicker = symbol.replace(/\.BA$/i, "").replace(/D$/i, "");
  const moneda = symbol.endsWith("D.BA") || symbol.endsWith("D") ? "D" : "$";
  const price = quote.price ?? 0;
  const prevClose = quote.price != null && quote.change != null ? quote.price - quote.change : price;

  return {
    fecha: quote.marketTime ? new Date(quote.marketTime).toISOString() : new Date().toISOString(),
    ticker: normalizedTicker,
    descripcion: symbol,
    tipoEmision: "BONO",
    segmento: "fallback",
    codigoSegmento: "fallback",
    plazo: "000",
    codigoPlazo: "000",
    moneda,
    fechaLiquidacion: quote.marketTime ? new Date(quote.marketTime).toISOString() : new Date().toISOString(),
    volumenAcumulado: quote.volume ?? 0,
    montoAcumulado: 0,
    precioUltimo: price,
    ultimaTasa: 0,
    precioCierreAnterior: prevClose,
    precioMinimo: quote.dayLow ?? price,
    precioMaximo: quote.dayHigh ?? price,
    openInterest: 0,
    precioCierre: price,
    variacion: quote.changePercent ?? 0,
  };
}

async function fetchFallbackRentafija(): Promise<MaeCotizacion[]> {
  const bondSymbols = AVAILABLE_STOCKS.filter((s) => s.type === "bond")
    .map((s) => s.symbol)
    .filter((symbol) => symbol.includes(".BA"));

  if (bondSymbols.length === 0) return [];

  const quotes = await fetchQuotes(bondSymbols);
  return quotes
    .filter((quote) => quote.price != null)
    .map((quote) => buildFallbackMaeCotizacion(quote.symbol, quote));
}

export async function fetchRentafija(): Promise<MaeCotizacion[]> {
  try {
    const live = await maeFetch<MaeCotizacion[]>("/mercado/cotizaciones/rentafija");
    if (live.length > 0) return live;
  } catch {
    // Fall back to the report endpoint when live quotes are unavailable.
  }

  try {
    const fecha = formatDateISO(getPreviousBusinessDay());
    const report = await maeFetch<MaeReporteResumen>(
      `/mercado/boletin/ReporteResumenFinal?fecha=${fecha}`
    );
    const fromReport = (report.segmento ?? []).flatMap((s) =>
      (s.titulos ?? []).map(reportTituloToCotizacion)
    );
    if (fromReport.length > 0) return fromReport;
  } catch {
    // Fall back to Yahoo-backed quotes if the MAE report is unavailable.
  }

  return fetchFallbackRentafija();
}

export async function fetchCauciones(): Promise<MaeCotizacion[]> {
  return maeFetch<MaeCotizacion[]>("/mercado/cotizaciones/cauciones");
}

export async function fetchForex(): Promise<MaeCotizacion[]> {
  return maeFetch<MaeCotizacion[]>("/mercado/cotizaciones/forex");
}

export interface MaeDerivadosData {
  rentafija: MaeCotizacion[];
  cauciones: MaeCotizacion[];
  forex: MaeCotizacion[];
  env: string;
  fetchedAt: string;
  rentafijaSource: "live" | "reporte" | "fallback";
}

export async function fetchDerivadosData(): Promise<MaeDerivadosData> {
  const config = getMaeConfig();
  const fallbackRentafija = await fetchFallbackRentafija();

  if (!hasMaeApiKey()) {
    return {
      rentafija: fallbackRentafija,
      cauciones: [],
      forex: [],
      env: config.env,
      fetchedAt: new Date().toISOString(),
      rentafijaSource: fallbackRentafija.length > 0 ? "fallback" : "live",
    };
  }

  let rentafija: MaeCotizacion[] = [];
  let cauciones: MaeCotizacion[] = [];
  let forex: MaeCotizacion[] = [];
  let rentafijaSource: "live" | "reporte" | "fallback" = "live";

  const [rentafijaResult, caucionesResult, forexResult] = await Promise.allSettled([
    maeFetch<MaeCotizacion[]>("/mercado/cotizaciones/rentafija"),
    fetchCauciones(),
    fetchForex(),
  ]);

  if (rentafijaResult.status === "fulfilled" && rentafijaResult.value.length > 0) {
    rentafija = rentafijaResult.value;
  } else if (fallbackRentafija.length > 0) {
    rentafija = fallbackRentafija;
    rentafijaSource = "fallback";
  }

  if (caucionesResult.status === "fulfilled") {
    cauciones = caucionesResult.value;
  }

  if (forexResult.status === "fulfilled") {
    forex = forexResult.value;
  }

  if (rentafija.length === 0) {
    const fecha = formatDateISO(getPreviousBusinessDay());
    try {
      const report = await maeFetch<MaeReporteResumen>(
        `/mercado/boletin/ReporteResumenFinal?fecha=${fecha}`
      );
      rentafija = (report.segmento ?? []).flatMap((s) =>
        (s.titulos ?? []).map(reportTituloToCotizacion)
      );
      rentafijaSource = "reporte";
    } catch {
      rentafija = fallbackRentafija;
      if (rentafija.length > 0) {
        rentafijaSource = "fallback";
      }
    }
  }

  return {
    rentafija,
    cauciones,
    forex,
    env: config.env,
    fetchedAt: new Date().toISOString(),
    rentafijaSource,
  };
}

/** Map MAE ticker + currency to Yahoo-style bond symbol when possible */
export function maeTickerToYahooSymbol(ticker: string, moneda: string): string {
  const base = ticker.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (moneda === "D") return `${base}D.BA`;
  return `${base}.BA`;
}

/** Filter rentafija rows for known bond tickers (plazo 000, bilateral segment preferred) */
export function filterBondQuotes(
  quotes: MaeCotizacion[],
  tickers: string[]
): MaeCotizacion[] {
  const tickerSet = new Set(
    tickers.map((t) => t.replace(/\.BA$/i, "").replace(/D$/i, "").toUpperCase())
  );
  return quotes.filter((q) => {
    const base = q.ticker.toUpperCase();
    if (!tickerSet.has(base)) return false;
    return q.plazo === "000" || q.plazo === "001";
  });
}

export function formatMaeMoneda(moneda: string): string {
  switch (moneda) {
    case "$":
      return "ARS";
    case "D":
      return "USD";
    case "T":
      return "ARS";
    default:
      return moneda;
  }
}

export interface MaeSymbolParams {
  ticker: string;
  moneda: string;
}

/** Parse Yahoo bond symbol into MAE ticker + currency */
export function yahooSymbolToMaeParams(symbol: string): MaeSymbolParams {
  const withoutBa = symbol.replace(/\.BA$/i, "");
  if (/D$/i.test(withoutBa)) {
    return { ticker: withoutBa.slice(0, -1).toUpperCase(), moneda: "D" };
  }
  return { ticker: withoutBa.toUpperCase(), moneda: "$" };
}

export function findMaeQuoteForSymbol(
  symbol: string,
  quotes: MaeCotizacion[]
): MaeCotizacion | undefined {
  const { ticker, moneda } = yahooSymbolToMaeParams(symbol);
  const matches = quotes.filter(
    (q) =>
      q.ticker.toUpperCase() === ticker &&
      q.moneda === moneda &&
      (q.plazo === "000" || q.plazo === "001")
  );
  return matches.find((q) => q.plazo === "000") ?? matches[0];
}

export interface MaeQuoteResult {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  marketTime: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  marketCap: number | null;
  source: "mae";
}

export function maeCotizacionToQuote(symbol: string, q: MaeCotizacion): MaeQuoteResult {
  const price = q.precioUltimo || q.precioCierre || null;
  const prev = q.precioCierreAnterior;
  const change =
    price != null && prev != null && prev > 0 ? price - prev : null;

  return {
    symbol,
    price,
    change,
    changePercent: q.variacion ?? null,
    currency: formatMaeMoneda(q.moneda),
    marketTime: q.fecha ? new Date(q.fecha).getTime() : null,
    dayHigh: q.precioMaximo > 0 ? q.precioMaximo : null,
    dayLow: q.precioMinimo > 0 ? q.precioMinimo : null,
    volume: q.volumenAcumulado > 0 ? q.volumenAcumulado : null,
    marketCap: null,
    source: "mae",
  };
}

/** Build bond quotes from MAE rentafija for symbols missing Yahoo data */
export function buildBondQuotesFromMae(
  symbols: string[],
  rentafija: MaeCotizacion[]
): MaeQuoteResult[] {
  return symbols
    .map((symbol) => {
      const mae = findMaeQuoteForSymbol(symbol, rentafija);
      return mae ? maeCotizacionToQuote(symbol, mae) : null;
    })
    .filter((q): q is MaeQuoteResult => q != null && q.price != null);
}
