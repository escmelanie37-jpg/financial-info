import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";
import { getUserId, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET() {
  const { userId, error } = await getUserId();
  if (error) return error;

  const list = await db.query.portfolios.findMany({
    where: eq(portfolios.userId, userId!),
    orderBy: desc(portfolios.createdAt),
    with: { positions: true },
  });

  return successResponse(list);
}

export async function POST(req: NextRequest) {
  const { userId, error } = await getUserId();
  if (error) return error;

  const body = await req.json();
  if (!body.name) return errorResponse("El nombre es obligatorio");

  const [portfolio] = await db.insert(portfolios).values({
    userId: userId!,
    name: body.name,
    description: body.description || null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }).returning();

  return successResponse(portfolio, 201);
}
