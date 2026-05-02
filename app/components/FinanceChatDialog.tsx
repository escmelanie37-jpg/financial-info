"use client";

import { FormEvent, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
  metadata?: {
    tables: string[];
    symbols: string[];
    fields: string[];
    dateRange: { from: string; to: string };
    recordsConsidered: number;
    generatedAt: string;
  };
};

const QUICK_PROMPTS = [
  "Resumen financiero de AAPL",
  "Compara MSFT vs GOOGL en valuation y crecimiento",
  "Que paso esta semana en el sector tecnologico",
  "Explicame PE, EPS y Free Cash Flow de forma simple",
  "Riesgos macro actuales para acciones de Estados Unidos",
  "Detecta oportunidades y riesgos en NVDA con los datos disponibles",
];

const STORAGE_KEY = "groq_api_key";

export function FinanceChatDialog() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  });
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = input.trim().length > 0 && !loading;

  const saveApiKey = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, apiKey.trim());
    setSaved(Boolean(apiKey.trim()));
  };

  const clearApiKey = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    setSaved(false);
  };

  const sendMessage = async (messageText: string) => {
    const message = messageText.trim();
    if (!message) return;
    if (!apiKey.trim()) {
      setError("Primero carga tu Groq API key.");
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          apiKey: apiKey.trim(),
          history: messages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      const data = (await response.json()) as {
        answer?: string;
        error?: string;
        metadata?: ChatMessage["metadata"];
      };

      if (!response.ok) {
        throw new Error(data.error || "Error al generar la respuesta.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer ?? "No se pudo generar respuesta.",
          metadata: data.metadata,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
      >
        Chat AI
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Finance Chat</h2>
                <p className="text-sm text-gray-600">
                  Pregunta de cualquier tema financiero y usa contexto de tu DB.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 border-b p-4">
              <label className="block text-sm font-medium text-gray-800">
                Groq API Key
              </label>
              <p className="text-xs text-gray-500">
                Crea una key en{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  console.groq.com
                </a>
                .
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={saveApiKey}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={clearApiKey}
                  className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Borrar
                </button>
              </div>
              {saved && <p className="text-xs text-green-700">API key guardada localmente.</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-sm text-gray-600">
                  Escribe una pregunta o usa un prompt rapido.
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={`rounded-lg p-3 text-sm ${
                    msg.role === "user"
                      ? "ml-10 bg-blue-600 text-white"
                      : "mr-10 bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === "assistant" && msg.metadata && (
                    <div className="mt-3 rounded-md border bg-white p-2 text-xs text-gray-700">
                      <p>
                        Datos usados: {msg.metadata.fields.join(", ")} | Tablas:{" "}
                        {msg.metadata.tables.join(", ")}
                      </p>
                      <p>
                        Simbolos: {msg.metadata.symbols.join(", ") || "N/A"} | Fechas:{" "}
                        {msg.metadata.dateRange.from} a {msg.metadata.dateRange.to}
                      </p>
                      <p>
                        Registros consultados: {msg.metadata.recordsConsidered} | Generado:{" "}
                        {msg.metadata.generatedAt}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="mr-10 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
                  Pensando...
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta financiera..."
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
