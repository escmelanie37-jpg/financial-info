export interface StockQuote {
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
}

export interface HistoricalDataPoint {
  timestamp: number;
  date: string;
  data: Record<string, number | null>;
}

export interface PollerState {
  current: Record<string, StockQuote>;
  historical: HistoricalDataPoint[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}
