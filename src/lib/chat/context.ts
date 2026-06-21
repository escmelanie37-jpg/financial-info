import { AVAILABLE_STOCKS } from "@/lib/stocks";
import type { ContextOption } from "@/types/chat";

export const MARKET_SYMBOLS = AVAILABLE_STOCKS.filter((s) => s.type !== "bond").map((s) => s.symbol);

export const CONTEXT_OPTIONS: { id: ContextOption; label: string }[] = [
  { id: "market", label: "📊 Precios" },
  { id: "indices", label: "📈 Índices" },
  { id: "macro", label: "💱 Dólar" },
  { id: "derivados", label: "📉 Derivados" },
  { id: "portfolio", label: "📁 Portafolio" },
];
