"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PollerState, HistoricalDataPoint, StockQuote } from "@/lib/types";

// Keep a larger in-memory window so chart granularity toggles
// (days/hours/minutes/seconds) have enough data to aggregate.
const MAX_HISTORICAL_POINTS = 10000;
const INITIAL_HISTORY_LIMIT = 10000;

export function useStockPoller(interval: number = 5000) {
  const [state, setState] = useState<PollerState>({
    current: {},
    historical: [],
    loading: false,
    error: null,
    lastUpdate: 0,
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(true);

  const fetchStocks = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/stocks");
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.statusText}`);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error("Invalid response format");
      }

      const stocks = json.data as StockQuote[];
      const currentMap: Record<string, StockQuote> = {};
      const dataPoint: Record<string, number | null> = {};

      stocks.forEach((stock) => {
        currentMap[stock.symbol] = stock;
        dataPoint[stock.symbol] = stock.price;
      });

      const timestamp = Date.now();
      const newHistoricalPoint: HistoricalDataPoint = {
        timestamp,
        date: new Date(timestamp).toLocaleTimeString(),
        data: dataPoint,
      };

      setState((prev) => {
        const newHistorical = [...prev.historical, newHistoricalPoint];
        // Limitar al máximo de puntos
        if (newHistorical.length > MAX_HISTORICAL_POINTS) {
          newHistorical.shift();
        }

        return {
          current: currentMap,
          historical: newHistorical,
          loading: false,
          error: null,
          lastUpdate: timestamp,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      console.error("Stock polling error:", error);
    }
  }, []);

  const loadHistoricalData = useCallback(async () => {
    try {
      const response = await fetch(`/api/stocks/history?limit=${INITIAL_HISTORY_LIMIT}`);
      if (!response.ok) return;

      const json = await response.json();
      if (!json.success || !json.data) return;

      const records = json.data as any[];
      const historicalMap: Record<number, HistoricalDataPoint> = {};

      // Agrupar registros por timestamp/fecha
      records.forEach((record) => {
        const timestamp = record.fetchedAt;
        if (!historicalMap[timestamp]) {
          historicalMap[timestamp] = {
            timestamp,
            date: new Date(timestamp).toLocaleTimeString(),
            data: {},
          };
        }
        historicalMap[timestamp].data[record.symbol] = record.price;
      });

      const newHistorical = Object.values(historicalMap)
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-MAX_HISTORICAL_POINTS);

      setState((prev) => ({
        ...prev,
        historical: newHistorical,
      }));
    } catch (error) {
      console.error("Failed to load historical data:", error);
    }
  }, []);

  const start = useCallback(() => {
    if (pollingRef.current) return;

    isRunningRef.current = true;
    fetchStocks(); // Fetch immediately on start
    pollingRef.current = setInterval(fetchStocks, interval);
  }, [fetchStocks, interval]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({
      current: {},
      historical: [],
      loading: false,
      error: null,
      lastUpdate: 0,
    });
  }, [stop]);

  // Auto-start on mount, cleanup on unmount
  useEffect(() => {
    loadHistoricalData(); // Load historical data once on mount
    start();
    return () => stop();
  }, [start, stop, loadHistoricalData]);

  return {
    ...state,
    start,
    stop,
    reset,
    refetch: fetchStocks,
    loadHistory: loadHistoricalData,
  };
}
