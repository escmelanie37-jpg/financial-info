"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import type { ChatMessage, Chat, ModelStatus, DownloadProgress, ContextOption } from "@/types/chat";
import { loadChats, saveChats } from "@/lib/chat/storage";
import { MARKET_SYMBOLS } from "@/lib/chat/context";
import type { MaeCotizacion } from "@/lib/services/mae";

const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
const CACHE_FLAG_KEY = "model-cached";

const MARKET_DATA_TTL = 60 * 60 * 1000; // 1 hour

const marketDataCache = { data: "", timestamp: 0 };

function formatMaeRow(q: MaeCotizacion, mode: "rentafija" | "cauciones" | "forex"): string {
  const moneda = q.moneda === "D" ? "USD" : q.moneda === "$" ? "ARS" : q.moneda;
  if (mode === "cauciones") {
    const tasa = q.ultimaTasa || q.precioCierre;
    return `${q.descripcion || q.ticker} plazo ${q.plazo}d: ${tasa ?? "N/A"}% (var ${q.variacion}%)`;
  }
  const price = q.precioUltimo || q.precioCierre;
  return `${q.ticker} (${moneda}, plazo ${q.plazo}): ${price ?? "N/A"} (var ${q.variacion}%)`;
}

async function fetchAllMarketData(enabled: Set<ContextOption>): Promise<string> {
  const now = Date.now();
  if (marketDataCache.data && now - marketDataCache.timestamp < MARKET_DATA_TTL) {
    return marketDataCache.data;
  }

  const blocks: string[] = [];

  if (enabled.has("market")) {
    try {
      const res = await fetch("/api/chat/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quotes", symbols: MARKET_SYMBOLS }),
      });
      const json = await res.json();
      if (res.ok && json.data && json.data.length > 0) {
        const lines = json.data.map((q: any) => {
          const chg = q.change != null ? (q.change >= 0 ? "+" : "") + q.change.toFixed(2) : "N/A";
          const chgPct = q.changePercent != null ? (q.changePercent >= 0 ? "+" : "") + q.changePercent.toFixed(2) : "N/A";
          const vol = q.volume != null ? `Vol ${(q.volume / 1e6).toFixed(1)}M` : "";
          const cap = q.marketCap != null ? `Cap $${(q.marketCap / 1e9).toFixed(1)}B` : "";
          return `${q.symbol}: $${q.price ?? "N/A"} (${chg} / ${chgPct}%)${q.dayHigh != null ? ` | Max $${q.dayHigh} Min $${q.dayLow}` : ""}${vol ? ` | ${vol}` : ""}${cap ? ` | ${cap}` : ""}`;
        });
        blocks.push(`📊 PRECIOS:\n${lines.join("\n")}`);
      }
    } catch {}
  }

  if (enabled.has("indices")) {
    try {
      const res = await fetch("/api/indices");
      const json = await res.json();
      if (res.ok && json.data && json.data.length > 0) {
        const lines = json.data.map((i: any) =>
          `${i.name}: ${i.price} (${i.change >= 0 ? "+" : ""}${i.change?.toFixed(2)} / ${i.changePercent?.toFixed(2)}%)`
        );
        blocks.push(`📈 ÍNDICES:\n${lines.join("\n")}`);
      }
    } catch {}
  }

  if (enabled.has("macro")) {
    try {
      const res = await fetch("/api/macro");
      const json = await res.json();
      if (res.ok && json.fxGap) {
        blocks.push(`💱 DÓLAR:\nOficial $${json.fxGap.official} | Blue $${json.fxGap.blue} | Brecha ${json.fxGap.gap}%`);
      }
    } catch {}
  }

  if (enabled.has("derivados")) {
    try {
      const res = await fetch("/api/derivados");
      const json = await res.json();
      if (res.ok) {
        const lines: string[] = ["📉 DERIVADOS MAE (A3):"];

        const bonos: MaeCotizacion[] = json.bonosMae ?? [];
        if (bonos.length > 0) {
          lines.push("RENTA FIJA (bonos):");
          for (const q of bonos.slice(0, 25)) {
            lines.push(formatMaeRow(q, "rentafija"));
          }
        } else if (json.rentafija?.length > 0) {
          lines.push(`RENTA FIJA (${json.rentafija.length} títulos, muestra):`);
          for (const q of (json.rentafija as MaeCotizacion[]).slice(0, 20)) {
            lines.push(formatMaeRow(q, "rentafija"));
          }
        }

        const cauciones: MaeCotizacion[] = json.cauciones ?? [];
        if (cauciones.length > 0) {
          lines.push("CAUCIONES:");
          for (const q of cauciones.slice(0, 12)) {
            lines.push(formatMaeRow(q, "cauciones"));
          }
        }

        const forex: MaeCotizacion[] = json.forex ?? [];
        if (forex.length > 0) {
          lines.push("FOREX:");
          for (const q of forex.slice(0, 12)) {
            lines.push(formatMaeRow(q, "forex"));
          }
        }

        if (json.rentafijaSource === "reporte") {
          lines.push("(Renta fija: cierre del último día hábil — mercado cerrado)");
        }

        if (lines.length > 1) {
          blocks.push(lines.join("\n"));
        }
      }
    } catch {}
  }

  if (enabled.has("portfolio")) {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        const portfolios = Array.isArray(data) ? data : data.data ?? [];
        if (Array.isArray(portfolios) && portfolios.length > 0) {
          const lines: string[] = ["📁 PORTAFOLIOS:"];
          let grandTotal = 0;
          for (const p of portfolios) {
            const pos = p.positions ?? [];
            if (pos.length === 0) { lines.push(`- ${p.name}: (vacío)`); continue; }
            const items: string[] = [];
            let subtotal = 0;
            for (const px of pos) {
              const total = (px.quantity ?? 0) * (px.averagePrice ?? 0);
              subtotal += total;
              items.push(`${px.symbol}: ${px.quantity}u × $${Number(px.averagePrice).toFixed(2)} = $${total.toFixed(2)}`);
            }
            grandTotal += subtotal;
            lines.push(`- ${p.name}: ${items.join(" | ")} | Subtotal: $${subtotal.toFixed(2)}`);
          }
          lines.push(`**Total General: $${grandTotal.toFixed(2)}**`);
          blocks.push(lines.join("\n"));
        }
      }
    } catch {}
  }

  if (blocks.length > 0) {
    marketDataCache.data = blocks.join("\n\n");
    marketDataCache.timestamp = now;
  }
  return marketDataCache.data;
}

interface WebLLMContextValue {
  modelStatus: ModelStatus;
  downloadProgress: DownloadProgress | null;
  engine: any;
  chats: Chat[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  createChat: () => string;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  sendMessage: (content: string, extraContext?: string, displayContent?: string, contextOptions?: Set<ContextOption>) => Promise<void>;
  interrupt: () => void;
  streamingContent: string;
  isGenerating: boolean;
  isCancelling: boolean;
  isCached: boolean;
  resetModel: () => Promise<void>;
}

const WebLLMContext = createContext<WebLLMContextValue | null>(null);

export function useWebLLM() {
  const ctx = useContext(WebLLMContext);
  if (!ctx) throw new Error("useWebLLM must be used within WebLLMProvider");
  return ctx;
}

export function WebLLMProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded: authLoaded, userId } = useAuth();
  const engineRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("inicializando");
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const streamingRef = useRef("");
  const interruptedRef = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    initializedRef.current = false;
    loadChats(userId).then((existing) => {
      const emptyId = crypto.randomUUID();
      const emptyChat: Chat = {
        id: emptyId,
        title: "Nuevo chat",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChats([emptyChat, ...existing]);
      setActiveChatId(emptyId);
      initializedRef.current = true;
    });
    if (localStorage.getItem(CACHE_FLAG_KEY) === "true") {
      setIsCached(true);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && initializedRef.current) {
      saveChats(userId, chats);
    }
  }, [chats, userId]);

  const createChat = useCallback(() => {
    const id = crypto.randomUUID();
    const chat: Chat = {
      id,
      title: "Nuevo chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => {
      const hasEmpty = prev.length > 0 && prev[0].messages.length === 0;
      if (hasEmpty) {
        setActiveChatId(prev[0].id);
        return prev;
      }
      setActiveChatId(id);
      return [chat, ...prev];
    });
    return id;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setActiveChatId((prev) => (prev === id ? null : prev));
  }, []);

  const renameChat = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c))
    );
  }, []);

  // Init engine
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!authLoaded || !isSignedIn) return;
      try {
        const worker = new Worker(
          new URL("../workers/llm.worker.ts", import.meta.url),
          { type: "module" }
        );

        const { CreateWebWorkerMLCEngine, hasModelInCache } = await import("@mlc-ai/web-llm");

        const cached = await hasModelInCache(MODEL_ID);
        if (cached) {
          setIsCached(true);
          localStorage.setItem(CACHE_FLAG_KEY, "true");
        }

        if (!cancelled) {
          if (cached) {
            setModelStatus("preparando_inferencia");
          }
        }

        const engine = await CreateWebWorkerMLCEngine(worker, MODEL_ID, {
          initProgressCallback: (report) => {
            if (cancelled) return;
            const text = report.text || "";
            const progress = report.progress || 0;

            let status: ModelStatus = cached ? "preparando_inferencia" : "descargando";
            if (progress >= 1) status = "listo";

            setModelStatus(status);
            setDownloadProgress({
              status,
              progress,
              text,
              loadedMB: 0,
              totalMB: 0,
              speedMBs: 0,
            });
          },
        }, {
          context_window_size: -1,
          sliding_window_size: 8192,
          attention_sink_size: 128,
        });

        if (cancelled) return;
        engineRef.current = engine;
        workerRef.current = worker;
        localStorage.setItem(CACHE_FLAG_KEY, "true");
        setIsCached(true);
        setModelStatus("listo");
        setDownloadProgress(null);
      } catch (err) {
        if (cancelled) return;
        console.error("WebLLM init error:", err);
        setModelStatus("error");
        setDownloadProgress({
          status: "error",
          progress: 0,
          text: `Error: ${err instanceof Error ? err.message : "desconocido"}`,
          loadedMB: 0,
          totalMB: 0,
          speedMBs: 0,
        });
      }
    }

    init();
    return () => {
      cancelled = true;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [authLoaded, isSignedIn]);

  const interrupt = useCallback(() => {
    interruptedRef.current = true;
    setIsCancelling(true);
  }, []);

  const sendMessage = useCallback(async (content: string, extraContext?: string, displayContent?: string, contextOptions?: Set<ContextOption>) => {
    const engine = engineRef.current;
    if (!engine || isGenerating) return;

    const chatId = activeChatId || createChat();

    // Show user message immediately
    const displayText = displayContent ?? content;
    const userMsg: ChatMessage = {
      role: "user",
      content,
      displayContent: displayText,
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() }
          : c
      )
    );

    setStreamingContent("");
    setIsGenerating(true);
    interruptedRef.current = false;

    // Fetch ALL market data for every message (in background, after showing message)
    const enabled = contextOptions ?? new Set<ContextOption>(["market", "indices", "macro", "portfolio"]);
    const marketContext = await fetchAllMarketData(enabled);

    // Build per-message augmented content
    const contextParts: string[] = [];
    if (extraContext) contextParts.push(extraContext);
    if (marketContext) contextParts.push(marketContext);

    const fullContext = contextParts.length > 0
      ? contextParts.join("\n\n")
      : "";

    const augmentedContent = fullContext
      ? `${fullContext}\n\n${content}`
      : content;

    // Update message content to include market context (silent, displayContent unchanged)
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.role === "user" && m.displayContent === displayText && m.content === content
                  ? { ...m, content: augmentedContent }
                  : m
              ),
              updatedAt: Date.now(),
            }
          : c
      )
    );

    try {
      const systemParts = [
        "Sos un asistente financiero. Respondé en Markdown.",
        "No des consejos de inversión.",
        "Terminá con: 'Información educativa, no es asesoría de inversión.'",
        "---",
        "DATOS DE MERCADO: el mensaje del usuario puede incluir datos de mercado al inicio (precios de acciones/criptos, índices, dólar, derivados MAE, portafolios). Usalos para responder.",
        "SOLO algunos pueden estar presentes según lo que el usuario seleccionó en los checkboxes de contexto.",
        "Si te preguntan por el precio de una acción o cripto y NO hay datos de precios en el mensaje, decí: 'Para ver precios activá 📊 Precios en el selector de contexto debajo del input.'",
        "Si te preguntan por bonos, renta fija, cauciones o forex argentinos y no hay datos de derivados, decí: 'Activá 📉 Derivados en el selector de contexto.'",
        "Si te preguntan por portafolios y no hay datos de portafolio, decí: 'Activá 📁 Portafolio en el selector de contexto.'",
        "Si te preguntan por dólar e índices y no hay datos, similar indicación.",
        "---",
        "REGLAS: **negritas** para datos clave. `código` para tickers. --- entre secciones. ### para títulos. Viñetas para listas. Tablas con |. Sin párrafos largos sin saltos.",
      ].join("\n");

      const systemMsg: ChatMessage = {
        role: "system",
        content: systemParts,
      };

      const history = chats.find((c) => c.id === chatId)?.messages ?? [];
      const messages = [...history, { ...userMsg, content: augmentedContent }];

      const chunks = await engine.chat.completions.create({
        messages: [{ role: "system" as const, content: systemMsg.content }, ...messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content }))],
        stream: true,
        temperature: 0.3,
        max_tokens: 1024,
      });

      let fullContent = "";
      for await (const chunk of chunks) {
        if (interruptedRef.current) {
          fullContent = "";
          streamingRef.current = "";
          continue;
        }
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          streamingRef.current = fullContent;
          setStreamingContent(fullContent);
        }
      }
      setStreamingContent(fullContent);

      if (!interruptedRef.current && fullContent) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, { role: "assistant", content: fullContent }],
                  title: c.messages.length <= 1 ? fullContent.slice(0, 50) + (fullContent.length > 50 ? "..." : "") : c.title,
                  updatedAt: Date.now(),
                }
              : c
          )
        );
      }
      setStreamingContent("");
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsGenerating(false);
      setIsCancelling(false);
    }
  }, [engineRef, isGenerating, activeChatId, chats, createChat]);

  const resetModel = useCallback(async () => {
    if (engineRef.current) {
      try {
        const { deleteModelAllInfoInCache } = await import("@mlc-ai/web-llm");
        await deleteModelAllInfoInCache(MODEL_ID);
      } catch {}
      engineRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setModelStatus("inicializando");
    setDownloadProgress(null);
    setStreamingContent("");
    setIsGenerating(false);
  }, []);

  return (
    <WebLLMContext.Provider
      value={{
        modelStatus,
        downloadProgress,
        engine: engineRef.current,
        chats,
        activeChatId,
        setActiveChatId,
        createChat,
        deleteChat,
        renameChat,
        sendMessage,
        interrupt,
        streamingContent,
        isGenerating,
        isCancelling,
        isCached,
        resetModel,
      }}
    >
      {children}
    </WebLLMContext.Provider>
  );
}
