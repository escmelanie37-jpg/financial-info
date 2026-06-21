"use client";

import { useEffect, useRef, useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useWebLLM } from "@/providers/WebLLMProvider";
import {
  Bot, User, Send, Square, Loader2, Plus, Trash2, X,
  Download, HardDrive, RefreshCw, AlertCircle, WifiOff, MessageSquare,
  History, Sparkles, Search, TrendingUp, BarChart3, PieChart, Globe, LogIn, ChevronDown,
} from "lucide-react";
import TEMPLATES from "@/lib/chat/templates";
import type { ChatTemplate } from "@/lib/chat/templates";
import { AVAILABLE_STOCKS } from "@/lib/stocks";
import { CONTEXT_OPTIONS } from "@/lib/chat/context";
import type { ContextOption } from "@/types/chat";

const PRESET_QUESTIONS = [
  "Optimizá un portafolio con AAPL, MSFT y NVDA usando Markowitz",
  "Calculá la matriz de correlación entre SPY, QQQ y VTI",
  "Compará la covarianza entre varios activos",
  "¿Qué peso debería tener cada activo en un portafolio de mínima varianza?",
  "Analizá el riesgo y el Sharpe de una cartera de acciones",
  "¿Cómo se interpreta la matriz de correlación?",
];

const CATEGORY_ICONS: Record<string, typeof BarChart3> = {
  "Fundamentos": Globe,
  "Técnico": TrendingUp,
  "Análisis Cuantitativo": BarChart3,
  "Mercado": PieChart,
};

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 * 1024
    ? `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

function DownloadScreen() {
  const { downloadProgress, modelStatus, resetModel } = useWebLLM();
  const progress = downloadProgress?.progress ?? 0;
  const loaded = downloadProgress?.loadedMB ?? 0;
  const total = downloadProgress?.totalMB ?? 0;
  const speed = downloadProgress?.speedMBs ?? 0;
  const text = downloadProgress?.text ?? "";
  const isError = modelStatus === "error";

  const statusMessages: Record<string, string> = {
    inicializando: "Inicializando motor...",
    descargando: "Descargando modelo...",
    cargando_pesos: "Cargando pesos del modelo...",
    compilando_shaders: "Compilando shaders (primera vez)...",
    preparando_inferencia: "Preparando inferencia...",
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <Bot className="w-8 h-8 text-blue-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold">Asistente IA Local</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isError
              ? "Error al cargar el modelo"
              : "Cargando Qwen 2.5 1.5B en tu navegador"}
          </p>
        </div>

        {isError ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{text || "No se pudo inicializar el motor WebLLM"}</span>
            </div>
            <details className="text-xs text-muted-foreground text-left bg-muted p-4 rounded-xl">
              <summary className="cursor-pointer font-medium">Posibles causas</summary>
              <ul className="mt-2 space-y-1 list-disc pl-4">
                <li>Navegador sin soporte WebGPU</li>
                <li>Usá Chrome, Edge, Opera o Firefox Nightly</li>
                <li>Verificá que WebGPU esté habilitado en chrome://flags</li>
                <li>Conexión de internet interrumpida</li>
              </ul>
            </details>
            <button
              onClick={resetModel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{statusMessages[modelStatus] || text}</span>
              {total > 0 && <span>{Math.round(progress * 100)}%</span>}
            </div>

            {total > 0 && (
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {formatBytes(loaded * 1024 * 1024)} / {formatBytes(total * 1024 * 1024)}
                </span>
                {speed > 0 && (
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {speed.toFixed(1)} MB/s
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              <WifiOff className="w-3 h-3 inline mr-1" />
              Se descarga una sola vez y se cachea en el navegador
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { chats, activeChatId, setActiveChatId, createChat, deleteChat, renameChat } = useWebLLM();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (!open) { setEditingId(null); setSearch(""); }
  }, [open]);

  if (!open) return null;

  const filtered = search.trim()
    ? chats.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : chats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Conversaciones</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pt-3 pb-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              No hay conversaciones
            </p>
          )}
          {filtered.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors ${
                chat.id === activeChatId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-foreground"
              }`}
              onClick={() => {
                setActiveChatId(chat.id);
                onClose();
              }}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              {editingId === chat.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => {
                    if (editTitle.trim()) renameChat(chat.id, editTitle.trim());
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (editTitle.trim()) renameChat(chat.id, editTitle.trim());
                      setEditingId(null);
                    }
                  }}
                  className="flex-1 bg-muted border border-border rounded px-1.5 py-0.5 text-sm focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 truncate"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(chat.id);
                    setEditTitle(chat.title);
                  }}
                >
                  {chat.title}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-negative/10 text-muted-foreground hover:text-negative transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type DialogView = "list" | "symbolInput";

function SuggestionsDialog({
  open, onClose, onRun,
}: {
  open: boolean;
  onClose: () => void;
  onRun: (template: ChatTemplate, symbols: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [view, setView] = useState<DialogView>("list");
  const [selectedTemplate, setSelectedTemplate] = useState<ChatTemplate | null>(null);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  useEffect(() => {
    if (!open) { setSearch(""); setStockSearch(""); setView("list"); setSelectedTemplate(null); setSelectedSymbols([]); }
  }, [open]);

  if (!open) return null;

  const categories = [...new Set(TEMPLATES.map((t) => t.category))] as const;

  const filtered = search.trim()
    ? TEMPLATES.filter(
        (t) =>
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : TEMPLATES;

  const filteredByCategory = categories
    .map((cat) => ({
      category: cat,
      icon: CATEGORY_ICONS[cat] ?? BarChart3,
      items: filtered.filter((t) => t.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  if (view === "symbolInput" && selectedTemplate) {
    const filteredStocks = stockSearch.trim()
      ? AVAILABLE_STOCKS.filter(
          (s) =>
            s.symbol.toLowerCase().includes(stockSearch.toLowerCase()) ||
            s.name.toLowerCase().includes(stockSearch.toLowerCase())
        )
      : AVAILABLE_STOCKS;

    const min = selectedTemplate.minSymbols ?? 1;
    const max = selectedTemplate.maxSymbols ?? 1;
    const canSubmit = selectedSymbols.length >= min && selectedSymbols.length <= max;
    const toggleSymbol = (sym: string) => {
      setSelectedSymbols((prev) =>
        prev.includes(sym)
          ? prev.filter((s) => s !== sym)
          : prev.length >= max ? prev
          : [...prev, sym]
      );
    };

    const hint = max > 1
      ? min > 1
        ? `Seleccioná entre ${min} y ${max} símbolos`
        : `Seleccioná hasta ${max} símbolos`
      : "Seleccioná 1 símbolo";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold">{selectedTemplate.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pt-3 pb-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Buscar acción..."
                className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="overflow-y-auto p-2 space-y-0.5 flex-1">
            {filteredStocks.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No se encontraron resultados</p>
            )}
            {filteredStocks.map((stock) => {
              const isSelected = selectedSymbols.includes(stock.symbol);
              return (
                <button
                  key={stock.symbol}
                  onClick={() => toggleSymbol(stock.symbol)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    stock.market === "ARG" ? "bg-yellow-500" : "bg-green-500"
                  }`} />
                  <span className="font-medium">{stock.symbol}</span>
                  <span className="text-muted-foreground truncate">{stock.name}</span>
                  {isSelected && (
                    <span className="ml-auto text-xs font-medium">✓</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="p-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedSymbols.length > 0
                ? `${selectedSymbols.length}/${max} seleccionado${selectedSymbols.length > 1 ? "s" : ""}`
                : `0/${max} seleccionados`}
              {min > 1 && selectedSymbols.length < min && ` (mín ${min})`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setView("list"); setSelectedTemplate(null); setSelectedSymbols([]); }}
                className="px-3 py-2 text-sm text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  if (canSubmit) {
                    onRun(selectedTemplate, selectedSymbols);
                    onClose();
                  }
                }}
                disabled={!canSubmit}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Analizar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[75vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Plantillas</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pt-3 pb-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plantilla..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-2 space-y-3">
          {filteredByCategory.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              No se encontraron resultados
            </p>
          )}
          {filteredByCategory.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <group.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.category}
                </span>
              </div>
              {group.items.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.needsSymbol) {
                      setSelectedTemplate(t);
                      setView("symbolInput");
                    } else {
                      onRun(t, []);
                      onClose();
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{t.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MessageBubble = memo(function MessageBubble({
  message,
}: {
  message: { role: string; content: string; displayContent?: string };
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-blue-400" />
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border text-foreground"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.displayContent ?? message.content}</p>
        ) : (
          <div className="prose prose-base prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-ul:my-2 prose-li:my-1 prose-headings:my-3 prose-headings:text-foreground prose-hr:my-4 prose-hr:border-border prose-code:px-1 prose-code:py-0.5 prose-code:bg-muted prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:text-left prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
});

export default function ChatPage() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const {
    modelStatus,
    chats,
    activeChatId,
    createChat,
    sendMessage,
    interrupt,
    streamingContent,
    isGenerating,
    isCancelling,
    isCached,
  } = useWebLLM();

  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [contextOptions, setContextOptions] = useState<Set<ContextOption>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userScrolledUp = useRef(false);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  const updateScrollButton = () => {
    const near = isNearBottom();
    setShowScrollButton(!near);
    if (!near) userScrolledUp.current = true;
    else userScrolledUp.current = false;
  };

  const scrollToBottom = () => {
    userScrolledUp.current = false;
    setShowScrollButton(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamingContent]);

  useEffect(() => {
    if (!isGenerating) {
      inputRef.current?.focus();
      if (!userScrolledUp.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [isGenerating]);

  useEffect(() => {
    if (modelStatus === "listo") {
      inputRef.current?.focus();
    }
  }, [modelStatus]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const msg = input.trim();
    setInput("");
    userScrolledUp.current = false;
    await sendMessage(msg, undefined, undefined, contextOptions);
  };

  const toggleContext = (opt: ContextOption) => {
    setContextOptions((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  if (!authLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold">Iniciá sesión</h2>
              <p className="text-sm text-muted-foreground">
                Necesitás una cuenta para usar el asistente financiero.
              </p>
              <a
                href="/sign-in"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (modelStatus !== "listo") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <DownloadScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <HistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <SuggestionsDialog
        open={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
        onRun={async (template, symbols) => {
          setTemplateLoading(true);
          try {
            const max = template.maxSymbols ?? 1;
            const symbol = symbols.slice(0, max).join(",");
            const msg = await template.build(symbol);
            const symbolNames = symbols.join(", ");
            const naturalDisplays: Record<string, string> = {
              "resumen-accion": `¿Podés darme un resumen completo de ${symbolNames}?`,
              "analisis-tecnico": `Hacé un análisis técnico completo de ${symbolNames}`,
              "riesgo-retorno": `Mostrame las métricas de riesgo y retorno de ${symbolNames}`,
              "beta-correlacion": `Analizá la beta y correlación de ${symbolNames} contra el SPY`,
              "comparar-acciones": `Compará ${symbolNames}`,
              "panorama-mercado": `Dame un panorama general del mercado`,
              "drawdown-maximo": `Analizá el drawdown máximo de ${symbolNames}`,
              "perfil-riesgo": `Mostrame el perfil de riesgo completo de ${symbolNames}`,
              "matriz-correlacion": `Calculá la matriz de correlación y covarianza entre ${symbolNames}`,
              "optimizacion-portafolio": `Optimizá un portafolio con ${symbolNames} usando Markowitz`,
              "comparar-varios": `Compará estos activos: ${symbolNames}`,
              "var-cvar": `Calculá el VaR y CVaR de ${symbolNames}`,
              "alfa-info-ratio": `Calculá el Alfa de Jensen e Information Ratio de ${symbolNames} vs SPY`,
            };
            const display = naturalDisplays[template.id] || `${template.label} - ${symbolNames}`;
            const templateCtx = new Set(template.needsContext);
            await sendMessage(msg, undefined, display, templateCtx);
          } catch (err) {
            await sendMessage(`Error al ejecutar "${template.label}": ${err instanceof Error ? err.message : "error desconocido"}`);
          } finally {
            setTemplateLoading(false);
          }
        }}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Chat con IA</h1>
            <p className="text-muted-foreground mt-1">Asistente financiero local</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Qwen 2.5 1.5B
            </span>
          </div>
        </div>

        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <div className="sticky top-0 z-10 bg-card border-b border-border flex items-center gap-1 p-2">
              <button
                onClick={() => {
                  createChat();
                  inputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo chat
              </button>
              <button
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <History className="w-4 h-4" />
                Historial
              </button>
            </div>

            <div
              ref={scrollRef}
              onScroll={updateScrollButton}
              className="flex-1 overflow-y-auto p-4 space-y-3 relative"
            >
              {(!activeChat || activeChat.messages.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-3">
                  <Bot className="w-12 h-12" />
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Asistente Financiero
                    </p>
                    <p className="text-sm max-w-md mt-1">
                      Preguntame sobre Markowitz, matriz de correlación, covarianza o optimización de cartera.
                      Todo corre localmente en tu navegador.
                    </p>
                  </div>
                  <button
                    onClick={() => setSuggestionsOpen(true)}
                    className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-colors"
                  >
                    Ver plantillas
                  </button>
                </div>
              )}

              {activeChat?.messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}

              {isGenerating && streamingContent && (
                <MessageBubble message={{ role: "assistant", content: streamingContent }} />
              )}

              {isGenerating && !streamingContent && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

              <div ref={bottomRef} />
            </div>

            {showScrollButton && (
              <div className="absolute bottom-4 right-4 z-20">
                <button
                  onClick={scrollToBottom}
                  className="flex items-center gap-1.5 px-3 py-2 bg-accent text-accent-foreground rounded-full shadow-lg hover:bg-accent/90 transition-colors text-xs font-medium"
                >
                  <ChevronDown className="w-4 h-4" />
                  Ir al final
                </button>
              </div>
            )}

            <div className="border-t border-border p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">Contexto:</span>
                {CONTEXT_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-colors select-none"
                    style={{
                      backgroundColor: contextOptions.has(opt.id) ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
                      color: contextOptions.has(opt.id) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={contextOptions.has(opt.id)}
                      onChange={() => toggleContext(opt.id)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Preguntá sobre Markowitz, correlación o cartera..."
                  className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  disabled={isGenerating}
                />
                <button
                  onClick={() => setSuggestionsOpen(true)}
                  disabled={isGenerating}
                  className="px-4 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Plantillas"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                {isGenerating ? (
                  <button
                    onClick={interrupt}
                    disabled={isCancelling}
                    className="px-5 py-3 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                    title="Interrumpir"
                  >
                    {isCancelling ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
