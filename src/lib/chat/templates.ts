import { calculateLogReturns, calculateMean, calculateCovarianceMatrix, calculateCorrelationMatrix, calculateMinVarianceWeights, calculateMaxSharpeWeights, calculatePortfolioReturn, calculatePortfolioVariance } from "@/lib/utils/calculations";
import type { ContextOption } from "@/types/chat";

export interface ChatTemplate {
  id: string;
  label: string;
  category: string;
  description: string;
  needsSymbol: boolean;
  minSymbols?: number;
  maxSymbols?: number;
  needsContext: ContextOption[];
  build: (symbol: string) => Promise<string>;
}

interface QuoteResult {
  symbol: string; price: number | null; change: number | null;
  changePercent: number | null; currency: string | null; marketTime: number | null;
  dayHigh: number | null; dayLow: number | null; volume: number | null; marketCap: number | null;
}

interface HistoryPoint {
  date: string; open: number | null; high: number | null;
  low: number | null; close: number | null; volume: number | null; adjClose: number | null;
}

async function api<T>(type: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/chat/data", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...payload }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "API error");
  return json.data;
}

const MONTHS = 12;

function fmt(num: number | null | undefined, decimals = 2): string {
  if (num == null) return "N/A";
  return num.toFixed(decimals);
}

function fmtPct(num: number | null | undefined): string {
  if (num == null) return "N/A";
  return `${(num * 100).toFixed(2)}%`;
}

const TEMPLATES: ChatTemplate[] = [
  {
    id: "resumen-accion",
    label: "Resumen de acción/bono",
    category: "Fundamentos",
    description: "Información completa sobre un instrumento financiero",
    needsSymbol: true,
    minSymbols: 1,
    maxSymbols: 1,
    needsContext: ["market"],
    async build(symbol) {
      const parts = symbol.split(/[\s,]+/).filter(Boolean);
      const sym = parts[0].toUpperCase();
      
      try {
        const quote = await api<QuoteResult>("quote", { symbol: sym });
        const history = await api<HistoryPoint[]>("history", { symbol: sym, months: 12 });
        
        const prices = history.map((h: HistoryPoint) => h.close).filter((c): c is number => c !== null);
        const returns = calculateLogReturns(prices);
        const meanRet = calculateMean(returns);
        const volatility = Math.sqrt(calculateMean(returns.map(r => Math.pow(r - meanRet, 2))));
        const annVol = volatility * Math.sqrt(252);
        const annRet = Math.pow(1 + meanRet, 252) - 1;
        
        return [
          `### Resumen de ${sym}`,
          ``,
          `**Precio actual:** $${quote.price ?? "N/A"}`,
          `**Variación:** ${quote.changePercent != null ? (quote.changePercent >= 0 ? "+" : "") + quote.changePercent.toFixed(2) + "%" : "N/A"}`,
          `**Volumen:** ${quote.volume != null ? (quote.volume / 1e6).toFixed(1) + "M" : "N/A"}`,
          `**Capitalización:** ${quote.marketCap != null ? "$" + (quote.marketCap / 1e9).toFixed(1) + "B" : "N/A"}`,
          ``,
          `**Métricas de Riesgo (12 meses):**`,
          `- Volatilidad anual: ${fmtPct(annVol)}`,
          `- Retorno anual: ${fmtPct(annRet)}`,
          `- Ratio Sharpe (asumiendo 3% libre): ${((annRet - 0.03) / annVol).toFixed(2)}`,
          ``,
          `**Rango del día:**`,
          `- Máximo: $${quote.dayHigh ?? "N/A"}`,
          `- Mínimo: $${quote.dayLow ?? "N/A"}`,
          ``,
          `Este análisis se basa en datos históricos de 12 meses. `,
          `La volatilidad indica cuánto varía el precio del activo. `,
          `Un Sharpe más alto indica mejor rendimiento ajustado por riesgo.`,
          ``,
          `Información educativa, no es asesoría de inversión.`,
        ].join("\n");
      } catch (error) {
        return `No se pudieron obtener datos para ${sym}. Verificá que el símbolo sea correcto.`;
      }
    },
  },
  {
    id: "analisis-tecnico",
    label: "Análisis técnico",
    category: "Técnico",
    description: "Análisis técnico de un instrumento",
    needsSymbol: true,
    minSymbols: 1,
    maxSymbols: 1,
    needsContext: ["market"],
    async build(symbol) {
      const parts = symbol.split(/[\s,]+/).filter(Boolean);
      const sym = parts[0].toUpperCase();
      
      try {
        const quote = await api<QuoteResult>("quote", { symbol: sym });
        const history = await api<HistoryPoint[]>("history", { symbol: sym, months: 6 });
        
        const prices = history.map((h: HistoryPoint) => h.close).filter((c): c is number => c !== null);
        const currentPrice = quote.price ?? prices[prices.length - 1] ?? 0;
        const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, prices.length);
        const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, prices.length);
        const highest = Math.max(...prices);
        const lowest = Math.min(...prices);
        
        const trend = currentPrice > sma20 && sma20 > sma50 ? "alcista" : 
                      currentPrice < sma20 && sma20 < sma50 ? "bajista" : "lateral";
        
        return [
          `### Análisis Técnico de ${sym}`,
          ``,
          `**Precio actual:** $${currentPrice}`,
          ``,
          `**Medias Móviles:**`,
          `- SMA 20: $${sma20.toFixed(2)}`,
          `- SMA 50: $${sma50.toFixed(2)}`,
          ``,
          `**Rango (6 meses):**`,
          `- Máximo: $${highest.toFixed(2)}`,
          `- Mínimo: $${lowest.toFixed(2)}`,
          ``,
          `**Tendencia:** ${trend.toUpperCase()}`,
          ``,
          `**Interpretación:**`,
          trend === "alcista" ? 
            `- El precio está por encima de las medias móviles, lo que sugiere tendencia alcista.` :
            trend === "bajista" ?
            `- El precio está por debajo de las medias móviles, lo que sugiere tendencia bajista.` :
            `- El precio está oscilando alrededor de las medias, indicando tendencia lateral.`,
          ``,
          `Información educativa, no es asesoría de inversión.`,
        ].join("\n");
      } catch (error) {
        return `No se pudieron obtener datos técnicos para ${sym}.`;
      }
    },
  },
  {
    id: "matriz-correlacion",
    label: "Matriz de correlación y covarianza",
    category: "Análisis Cuantitativo",
    description: "Correlación y covarianza entre activos para diversificación",
    needsSymbol: true,
    minSymbols: 2,
    maxSymbols: 6,
    needsContext: [],
    async build(symbol) {
      const parts = symbol.split(/[\s,]+/).filter(Boolean);
      const histories = await Promise.all(
        parts.map((s) => api<HistoryPoint[]>("history", { symbol: s.toUpperCase(), months: 12 }))
      );
      const pricesList = histories.map((h) =>
        h.map((p: HistoryPoint) => p.close).filter((c): c is number => c !== null)
      );
      const minLen = Math.min(...pricesList.map((p) => p.length));
      if (minLen < 2) return "No hay datos suficientes.";

      const aligned = pricesList.map((p) => p.slice(-minLen));
      const returnsList = aligned.map((p) => calculateLogReturns(p));
      const covMatrix = calculateCovarianceMatrix(returnsList);
      const corrMatrix = calculateCorrelationMatrix(covMatrix);

      const hdr = `| | ${parts.map((s) => ` ${s.toUpperCase()} `).join(" | ")} |`;
      const sep = `|---|${parts.map(() => "---|").join("")}`;
      const corrRows = corrMatrix.map((row, i) =>
        `| ${parts[i].toUpperCase()} | ${row.map((v) => ` ${fmt(v)} `).join(" | ")} |`
      ).join("\n");
      const covRows = covMatrix.map((row, i) =>
        `| ${parts[i].toUpperCase()} | ${row.map((v) => ` ${v.toFixed(6)} `).join(" | ")} |`
      ).join("\n");

      return [
        `### Matriz de Correlación y Covarianza`,
        ``,
        `**Observaciones:** ${minLen} (12 meses)`,
        ``,
        `**Matriz de Correlación:**`,
        ``,
        hdr,
        sep,
        corrRows,
        ``,
        `**Matriz de Covarianza:**`,
        ``,
        hdr,
        sep,
        covRows,
        ``,
        `### Interpretación`,
        `- **Correlación cercana a 1:** Los activos se mueven juntos (menos diversificación)`,
        `- **Correlación cercana a -1:** Los activos se mueven en direcciones opuestas (máxima diversificación)`,
        `- **Correlación cercana a 0:** Los activos no están relacionados (buena diversificación)`,
        ``,
        `Analizá estas matrices para construir un portafolio balanceado.`,
        `Información educativa, no es asesoría de inversión.`,
      ].join("\n");
    },
  },
  {
    id: "optimizacion-portafolio",
    label: "Optimización de portafolio (Markowitz)",
    category: "Análisis Cuantitativo",
    description: "Portafolio de mínima varianza, máximo Sharpe y frontier",
    needsSymbol: true,
    minSymbols: 2,
    maxSymbols: 6,
    needsContext: [],
    async build(symbol) {
      const parts = symbol.split(/[\s,]+/).filter(Boolean);
      const histories = await Promise.all(
        parts.map((s) => api<HistoryPoint[]>("history", { symbol: s.toUpperCase(), months: 12 }))
      );
      const pricesList = histories.map((h) =>
        h.map((p: HistoryPoint) => p.close).filter((c): c is number => c !== null)
      );
      const minLen = Math.min(...pricesList.map((p) => p.length));
      if (minLen < 2) return "No hay datos suficientes.";

      const aligned = pricesList.map((p) => p.slice(-minLen));
      const returnsList = aligned.map((p) => calculateLogReturns(p));
      const covMatrix = calculateCovarianceMatrix(returnsList);
      const meanReturns = returnsList.map((r) => calculateMean(r));
      const riskFree = 0.03;
      const tradingDays = 252;
      const annReturns = meanReturns.map((r) => Math.pow(1 + r, tradingDays) - 1);
      const minVarWeights = calculateMinVarianceWeights(covMatrix);
      const maxSharpeWeights = calculateMaxSharpeWeights(covMatrix, meanReturns);
      const minVarRet = calculatePortfolioReturn(minVarWeights, meanReturns);
      const minVarVar = calculatePortfolioVariance(minVarWeights, covMatrix);
      const minVarVol = Math.sqrt(minVarVar) * Math.sqrt(tradingDays);
      const minVarAnnRet = Math.pow(1 + minVarRet, tradingDays) - 1;
      const minVarSharpe = (minVarAnnRet - riskFree) / minVarVol;
      const maxShpRet = calculatePortfolioReturn(maxSharpeWeights, meanReturns);
      const maxShpVar = calculatePortfolioVariance(maxSharpeWeights, covMatrix);
      const maxShpVol = Math.sqrt(maxShpVar) * Math.sqrt(tradingDays);
      const maxShpAnnRet = Math.pow(1 + maxShpRet, tradingDays) - 1;
      const maxShpSharpe = (maxShpAnnRet - riskFree) / maxShpVol;

      const hdr = `| Activo | Retorno Anual | Volatilidad | Min Var | Max Sharpe |`;
      const sep = `|---|---|---|---|---|`;
      const rows = parts.map((s, i) =>
        `| ${s.toUpperCase()} | ${fmtPct(annReturns[i])} | ${fmtPct(Math.sqrt(covMatrix[i][i]) * Math.sqrt(tradingDays))} | ${fmtPct(minVarWeights[i])} | ${fmtPct(maxSharpeWeights[i])} |`
      ).join("\n");

      return [
        `### Optimización de Portafolio (Markowitz)`,
        ``,
        `**Datos:** ${minLen} observaciones, 12 meses, tasa libre ${riskFree * 100}%`,
        ``,
        hdr,
        sep,
        rows,
        ``,
        `### Portafolio de Mínima Varianza`,
        `- **Retorno anual:** ${fmtPct(minVarAnnRet)}`,
        `- **Volatilidad anual:** ${fmtPct(minVarVol)}`,
        `- **Sharpe:** ${fmt(minVarSharpe)}`,
        `- **Pesos:** ${parts.map((s, i) => `${s.toUpperCase()}: ${fmtPct(minVarWeights[i])}`).join(", ")}`,
        ``,
        `### Portafolio de Máximo Sharpe`,
        `- **Retorno anual:** ${fmtPct(maxShpAnnRet)}`,
        `- **Volatilidad anual:** ${fmtPct(maxShpVol)}`,
        `- **Sharpe:** ${fmt(maxShpSharpe)}`,
        `- **Pesos:** ${parts.map((s, i) => `${s.toUpperCase()}: ${fmtPct(maxSharpeWeights[i])}`).join(", ")}`,
        ``,
        `### Interpretación`,
        `- **Mínima Varianza:** Portafolio más conservador, menor riesgo`,
        `- **Máximo Sharpe:** Mejor relación riesgo-retorno`,
        ``,
        `Elegí el portafolio según tu perfil de riesgo.`,
        `Información educativa, no es asesoría de inversión.`,
      ].join("\n");
    },
  },
];

export default TEMPLATES;
