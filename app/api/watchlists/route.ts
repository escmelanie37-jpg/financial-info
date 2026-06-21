import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { watchlists } from "@/lib/schema";
import { getUserId, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET() {
  const { userId, error } = await getUserId();
  if (error) return error;

  const list = await db.query.watchlists.findMany({
    where: eq(watchlists.userId, userId!),
    orderBy: desc(watchlists.createdAt),
    with: { assets: true },
  });

  return successResponse(list);
}

export async function POST(req: NextRequest) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const body = await req.json();
  if (!body.name) return errorResponse("El nombre es obligatorio");

  const [watchlist] = await db.insert(watchlists).values({
    userId: userId!,
    name: body.name,
    createdAt: Date.now(),
  }).returning();

  return successResponse(watchlist, 201);
}
