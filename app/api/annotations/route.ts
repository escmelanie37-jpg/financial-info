import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chartAnnotations } from "@/lib/schema";
import { getUserId, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  const list = await db.query.chartAnnotations.findMany({
    where: symbol ? eq(chartAnnotations.symbol, symbol.toUpperCase()) : undefined,
    orderBy: desc(chartAnnotations.date),
  });

  return successResponse(list);
}

export async function POST(req: NextRequest) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const body = await req.json();
  if (!body.symbol || !body.title) {
    return errorResponse("symbol y title son obligatorios");
  }

  const [annotation] = await db.insert(chartAnnotations).values({
    userId: userId!,
    symbol: body.symbol.toUpperCase(),
    title: body.title,
    note: body.note || null,
    date: body.date ? new Date(body.date).getTime() : Date.now(),
    createdAt: Date.now(),
  }).returning();

  return successResponse(annotation, 201);
}

export async function DELETE(req: NextRequest) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return errorResponse("id es obligatorio");

  const [deleted] = await db.delete(chartAnnotations)
    .where(and(eq(chartAnnotations.id, Number(id)), eq(chartAnnotations.userId, userId!)))
    .returning();

  if (!deleted) return errorResponse("Anotación no encontrada", 404);
  return successResponse(deleted);
}
