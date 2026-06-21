import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { positions, portfolios } from "@/lib/schema";
import { getUserId, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/portfolio/[id]/positions">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const portfolio = await db.query.portfolios.findFirst({
    where: and(eq(portfolios.id, Number(id)), eq(portfolios.userId, userId!)),
  });

  if (!portfolio) return errorResponse("Portafolio no encontrado", 404);

  const list = await db.query.positions.findMany({
    where: eq(positions.portfolioId, Number(id)),
  });

  return successResponse(list);
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/portfolio/[id]/positions">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const portfolio = await db.query.portfolios.findFirst({
    where: and(eq(portfolios.id, Number(id)), eq(portfolios.userId, userId!)),
  });

  if (!portfolio) return errorResponse("Portafolio no encontrado", 404);

  const body = await req.json();
  if (!body.symbol || !body.quantity || !body.averagePrice) {
    return errorResponse("symbol, quantity y averagePrice son obligatorios");
  }

  const [position] = await db.insert(positions).values({
    portfolioId: Number(id),
    symbol: body.symbol.toUpperCase(),
    quantity: Number(body.quantity),
    averagePrice: Number(body.averagePrice),
    purchaseDate: body.purchaseDate ? new Date(body.purchaseDate).getTime() : Date.now(),
    createdAt: Date.now(),
  }).returning();

  return successResponse(position, 201);
}
