"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/formatters";

interface Asset {
  symbol: string;
  price: number | null;
  changePercent: number | null;
  currency: string | null;
}

type Tab = "US" | "ADRs" | "Local";

const tabs: { key: Tab; label: string }[] = [
  { key: "US", label: "US Stocks" },
  { key: "ADRs", label: "Argentina ADRs" },
  { key: "Local", label: "Local Market" },
];

export function TopAssetsCard() {
  const [activeTab, setActiveTab] = useState<Tab>("US");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/stocks");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const allAssets: Asset[] = data.data ?? [];
        setAssets(allAssets);
      } catch {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = assets.filter((a) => {
    if (activeTab === "US") return ["USD", "US"].includes(a.currency ?? "");
    if (activeTab === "ADRs")
      return ["YPF", "GGAL", "BMA", "PAM", "SUPV", "BBAR", "CEPU", "LOMA", "EDN", "TGS"].includes(
        a.symbol
      );
    return false;
  });

  const displayAssets = filtered.slice(0, 5);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-accent text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {displayAssets.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sin activos en esta categoría
            </p>
          )}
          {displayAssets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <span className="text-sm font-medium text-foreground">
                {asset.symbol}
              </span>
              <div className="text-right">
                <p className="text-sm text-foreground">
                  {asset.price?.toFixed(2) ?? "—"}
                </p>
                {asset.changePercent !== null && (
                  <p
                    className={`text-xs ${
                      asset.changePercent >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {formatPercent(asset.changePercent)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
