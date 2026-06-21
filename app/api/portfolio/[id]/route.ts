import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";
import { getUserId, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/portfolio/[id]">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const portfolio = await db.query.portfolios.findFirst({
    where: and(eq(portfolios.id, Number(id)), eq(portfolios.userId, userId!)),
    with: { positions: true },
  });

  if (!portfolio) return errorResponse("Portafolio no encontrado", 404);
  return successResponse(portfolio);
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/portfolio/[id]">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const body = await req.json();

  const [updated] = await db.update(portfolios)
    .set({
      name: body.name,
      description: body.description,
      updatedAt: Date.now(),
    })
    .where(and(eq(portfolios.id, Number(id)), eq(portfolios.userId, userId!)))
    .returning();

  if (!updated) return errorResponse("Portafolio no encontrado", 404);
  return successResponse(updated);
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/portfolio/[id]">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const [deleted] = await db.delete(portfolios)
    .where(and(eq(portfolios.id, Number(id)), eq(portfolios.userId, userId!)))
    .returning();

  if (!deleted) return errorResponse("Portafolio no encontrado", 404);
  return successResponse(deleted);
}
