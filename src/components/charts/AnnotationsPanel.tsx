"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils/formatters";

interface Annotation {
  id: number;
  symbol: string;
  title: string;
  note: string | null;
  date: number;
}

interface AnnotationsPanelProps {
  symbol: string;
}

export function AnnotationsPanel({ symbol }: AnnotationsPanelProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/annotations?symbol=${symbol}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAnnotations(Array.isArray(data) ? data : []);
      } catch {
        setAnnotations([]);
      } finally {
        setLoading(false);
      }
    }
    if (symbol) load();
  }, [symbol]);

  const add = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, title, note }),
      });
      if (!res.ok) throw new Error();
      const ann = await res.json();
      setAnnotations((prev) => [ann, ...prev]);
      setTitle("");
      setNote("");
    } catch {}
  };

  const remove = async (id: number) => {
    try {
      await fetch(`/api/annotations?id=${id}`, { method: "DELETE" });
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch {}
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-muted rounded" />;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título..."
          className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional)..."
          rows={2}
          className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
        />
        <button
          onClick={add}
          disabled={!title.trim()}
          className="w-full px-2 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 disabled:opacity-50"
        >
          Agregar
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {annotations.map((ann) => (
          <div key={ann.id} className="bg-muted rounded p-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-foreground">{ann.title}</p>
              <button onClick={() => remove(ann.id)} className="text-muted-foreground hover:text-negative text-xs">&times;</button>
            </div>
            {ann.note && <p className="text-xs text-muted-foreground mt-1">{ann.note}</p>}
            <p className="text-xs text-muted-foreground mt-1">{formatDate(ann.date)}</p>
          </div>
        ))}
        {annotations.length === 0 && (
          <p className="text-xs text-muted-foreground">Sin anotaciones</p>
        )}
      </div>
    </div>
  );
}
