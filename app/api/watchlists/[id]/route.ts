import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { watchlists, watchlistAssets } from "@/lib/schema";
import { getUserId, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/watchlists/[id]">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const watchlist = await db.query.watchlists.findFirst({
    where: and(eq(watchlists.id, Number(id)), eq(watchlists.userId, userId!)),
    with: { assets: true },
  });

  if (!watchlist) return errorResponse("Watchlist no encontrada", 404);
  return successResponse(watchlist);
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/watchlists/[id]">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const [deleted] = await db.delete(watchlists)
    .where(and(eq(watchlists.id, Number(id)), eq(watchlists.userId, userId!)))
    .returning();

  if (!deleted) return errorResponse("Watchlist no encontrada", 404);
  return successResponse(deleted);
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/watchlists/[id]">) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { id } = await ctx.params;
  const body = await req.json();

  if (body.action === "add-asset") {
    const [asset] = await db.insert(watchlistAssets).values({
      watchlistId: Number(id),
      symbol: body.symbol.toUpperCase(),
      createdAt: Date.now(),
    }).returning();

    return successResponse(asset, 201);
  }

  if (body.action === "remove-asset") {
    const [deleted] = await db.delete(watchlistAssets)
      .where(and(
        eq(watchlistAssets.watchlistId, Number(id)),
        eq(watchlistAssets.symbol, body.symbol.toUpperCase())
      ))
      .returning();

    if (!deleted) return errorResponse("Asset no encontrado", 404);
    return successResponse(deleted);
  }

  return errorResponse("Acción no válida. Usar 'add-asset' o 'remove-asset'");
}
