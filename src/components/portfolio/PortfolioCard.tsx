"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";

interface PortfolioCardProps {
  name: string;
  description?: string | null;
  totalValue: number;
  totalCost: number;
  positionCount: number;
  onClick?: () => void;
  onDelete?: () => void;
}

export function PortfolioCard({
  name,
  description,
  totalValue,
  totalCost,
  positionCount,
  onClick,
  onDelete,
}: PortfolioCardProps) {
  const pnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

  return (
    <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{name}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {positionCount} {positionCount === 1 ? "posición" : "posiciones"}
        </Badge>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Valor Total</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(totalValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">P&L</p>
          <p className={`text-sm font-semibold ${pnl >= 0 ? "text-positive" : "text-negative"}`}>
            {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
          </p>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="mt-2 text-xs text-muted-foreground hover:text-negative transition-colors"
        >
          Eliminar
        </button>
      )}
    </Card>
  );
}
