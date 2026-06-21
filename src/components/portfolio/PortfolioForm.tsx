"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface PortfolioFormProps {
  onSubmit: (name: string, description: string) => Promise<void>;
  onCancel?: () => void;
}

export function PortfolioForm({ onSubmit, onCancel }: PortfolioFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSubmit(name.trim(), description.trim());
    setSubmitting(false);
    setName("");
    setDescription("");
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Nuevo Portafolio</h4>
        <div>
          <label className="text-xs text-muted-foreground">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi portafolio"
            required
            className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Inversiones a largo plazo..."
            rows={2}
            className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="px-4 py-1.5 text-sm bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? "Creando..." : "Crear"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 text-sm bg-muted text-foreground rounded hover:bg-muted/80"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
