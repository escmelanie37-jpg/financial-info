import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stockQuotes, users, portfolios } from "@/lib/schema";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} días`;
  return new Date(ts).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function riskLevel(n: number): string {
  if (n === 0) return "—";
  if (n <= 2) return "Alto";
  if (n <= 5) return "Moderado";
  return "Bajo";
}

export async function GET() {
  const { userId: clerkId } = await auth();

  const allQuotes = await db.select().from(stockQuotes);
  const shuffled = [...allQuotes].sort(() => Math.random() - 0.5);
  const marketStocks = shuffled.slice(0, 6);

  if (!clerkId) {
    return NextResponse.json({ authenticated: false, marketStocks });
  }

  let user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    const [created] = await db.insert(users).values({
      clerkId,
      email: "",
      createdAt: Date.now(),
    }).returning();
    user = created;
  }

  const userPortfolios = await db.query.portfolios.findMany({
    where: eq(portfolios.userId, user.id),
    with: { positions: true },
  });

  const allPositions = userPortfolios.flatMap(p => p.positions);

  const priceMap: Record<string, number> = {};
  allQuotes.forEach(q => {
    if (q.price !== null) priceMap[q.symbol] = q.price;
  });

  let valorTotal = 0;
  let costoTotal = 0;
  const symbolSet = new Set<string>();
  const posBySymbol: Record<string, { qty: number; avg: number }> = {};

  allPositions.forEach(pos => {
    const currentPrice = priceMap[pos.symbol] ?? pos.averagePrice;
    valorTotal += pos.quantity * currentPrice;
    costoTotal += pos.quantity * pos.averagePrice;
    symbolSet.add(pos.symbol);

    if (!posBySymbol[pos.symbol]) {
      posBySymbol[pos.symbol] = { qty: 0, avg: 0 };
    }
    posBySymbol[pos.symbol].qty += pos.quantity;
    posBySymbol[pos.symbol].avg = pos.averagePrice;
  });

  const rendimientoMensual = costoTotal > 0
    ? Math.round(((valorTotal - costoTotal) / costoTotal) * 100 * 10) / 10
    : 0;

  const allocation = Object.entries(posBySymbol).map(([label, data]) => {
    const currentPrice = priceMap[label] ?? data.avg;
    const v = data.qty * currentPrice;
    return { label, value: valorTotal > 0 ? Math.round((v / valorTotal) * 100) : 0 };
  });

  const recentActivity = [...allPositions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)
    .map(pos => ({
      type: "Compra" as const,
      symbol: pos.symbol,
      amount: `$${(pos.quantity * (priceMap[pos.symbol] ?? pos.averagePrice)).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      time: timeAgo(pos.createdAt),
    }));

  const sortedPositions = [...allPositions].sort((a, b) => a.purchaseDate - b.purchaseDate);

  const monthlyGroups: Record<string, number> = {};
  sortedPositions.forEach(pos => {
    const d = new Date(pos.purchaseDate);
    const key = `${MONTHS[d.getMonth()]}${d.getFullYear().toString().slice(-2)}`;
    monthlyGroups[key] = (monthlyGroups[key] || 0) + pos.quantity * pos.averagePrice;
  });

  let cumulative = 0;
  const historicalPerformance = Object.entries(monthlyGroups).map(([month, cost]) => {
    cumulative += cost;
    return { month, value: cumulative };
  });

  return NextResponse.json({
    authenticated: true,
    stats: {
      valorTotal: Math.round(valorTotal * 100) / 100,
      rendimientoMensual,
      riesgoTotal: riskLevel(symbolSet.size),
      activos: allPositions.length,
    },
    allocation,
    recentActivity,
    historicalPerformance,
    marketStocks,
  });
}
