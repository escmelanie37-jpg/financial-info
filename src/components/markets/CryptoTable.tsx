"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/utils/formatters";

interface Crypto {
  symbol: string;
  name: string;
  price: number | null;
  marketCap: number | null;
  volume: number | null;
  changePercent: number | null;
}

export function CryptoTable() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ids = ["bitcoin", "ethereum", "solana", "ripple", "cardano", "polkadot", "avalanche-2", "chainlink", "polygon", "near"];
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const map: Record<string, string> = {
          bitcoin: "BTC", ethereum: "ETH", "solana": "SOL", ripple: "XRP",
          cardano: "ADA", polkadot: "DOT", "avalanche-2": "AVAX",
          chainlink: "LINK", polygon: "MATIC", near: "NEAR",
        };
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          symbol: map[id] ?? id.toUpperCase(),
          name: id.charAt(0).toUpperCase() + id.slice(1),
          price: val.usd ?? null,
          marketCap: val.usd_market_cap ?? null,
          volume: val.usd_24h_vol ?? null,
          changePercent: val.usd_24h_change ?? null,
        }));
        setCryptos(list);
      } catch {
        setCryptos([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Nombre</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Precio</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">24h</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium hidden md:table-cell">
              Market Cap
            </th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium hidden lg:table-cell">
              Volumen
            </th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto, i) => (
            <tr key={crypto.symbol} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-2 px-2 text-muted-foreground">{i + 1}</td>
              <td className="py-2 px-2">
                <span className="font-medium text-foreground">{crypto.symbol}</span>
                <span className="text-muted-foreground ml-2 text-xs">{crypto.name}</span>
              </td>
              <td className="py-2 px-2 text-right text-foreground">
                {formatCurrency(crypto.price)}
              </td>
              <td className={`py-2 px-2 text-right ${crypto.changePercent !== null && crypto.changePercent >= 0 ? "text-positive" : "text-negative"}`}>
                {formatPercent(crypto.changePercent)}
              </td>
              <td className="py-2 px-2 text-right text-muted-foreground hidden md:table-cell">
                {formatCompactNumber(crypto.marketCap)}
              </td>
              <td className="py-2 px-2 text-right text-muted-foreground hidden lg:table-cell">
                {formatCompactNumber(crypto.volume)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
