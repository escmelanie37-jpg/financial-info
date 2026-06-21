// Empty types file for financial-info dashboard project
// This is a placeholder that would normally define the stock quote type
export interface StockQuote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  marketCap: number | null;
  currency: string | null;
  marketTime: string | null;
  fetchedAt: number | null;
}

export interface HistoricalDataPoint {
  timestamp: number;
  date: string;
  [key: string]: number | string | null;
}

export interface PollerState {
  current: Record<string, StockQuote>;
  historical: HistoricalDataPoint[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}