"use client";

import { formatCurrency, formatDate, formatPercent, formatChange } from "@/lib/utils/formatters";

interface Position {
  id: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  purchaseDate: number;
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
}

interface PositionTableProps {
  positions: Position[];
  onDelete?: (id: number) => void;
}

export function PositionTable({ positions, onDelete }: PositionTableProps) {
  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Sin posiciones. Agregá tu primera posición.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Símbolo</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Cantidad</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Precio Prom.</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Precio Actual</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Valor</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">P&L</th>
            <th className="text-left py-2 px-2 text-muted-foreground font-medium hidden md:table-cell">Fecha</th>
            {onDelete && <th className="py-2 px-2" />}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const currentPrice = pos.price ?? pos.averagePrice;
            const value = pos.quantity * currentPrice;
            const cost = pos.quantity * pos.averagePrice;
            const pnl = value - cost;
            const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

            return (
              <tr key={pos.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-2 px-2 font-medium text-foreground">{pos.symbol}</td>
                <td className="py-2 px-2 text-right text-foreground">{pos.quantity}</td>
                <td className="py-2 px-2 text-right text-foreground">{formatCurrency(pos.averagePrice)}</td>
                <td className="py-2 px-2 text-right text-foreground">{formatCurrency(pos.price)}</td>
                <td className="py-2 px-2 text-right text-foreground">{formatCurrency(value)}</td>
                <td className={`py-2 px-2 text-right ${pnl >= 0 ? "text-positive" : "text-negative"}`}>
                  <p>{formatCurrency(pnl)}</p>
                  <p className="text-xs">{formatPercent(pnlPercent)}</p>
                </td>
                <td className="py-2 px-2 text-muted-foreground hidden md:table-cell">
                  {formatDate(pos.purchaseDate)}
                </td>
                {onDelete && (
                  <td className="py-2 px-2">
                    <button
                      onClick={() => onDelete(pos.id)}
                      className="text-xs text-muted-foreground hover:text-negative"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
