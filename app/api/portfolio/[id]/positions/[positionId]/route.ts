import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { positions, portfolios } from "@/lib/schema";
import { getUserId, errorResponse, successResponse } from "@/lib/api-helpers";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/portfolio/[id]/positions/[positionId]">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id, positionId } = await ctx.params;
  const portfolio = await db.query.portfolios.findFirst({
    where: and(eq(portfolios.id, Number(id)), eq(portfolios.userId, userId!)),
  });

  if (!portfolio) return errorResponse("Portafolio no encontrado", 404);

  const [deleted] = await db.delete(positions)
    .where(and(eq(positions.id, Number(positionId)), eq(positions.portfolioId, Number(id))))
    .returning();

  if (!deleted) return errorResponse("Posición no encontrada", 404);
  return successResponse(deleted);
}
