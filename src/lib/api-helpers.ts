import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, portfolios, watchlists, chartAnnotations, positions } from "@/lib/schema";

export async function getUserId(): Promise<{ userId: number | null; error: NextResponse | null }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { userId: null, error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
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

  return { userId: user.id, error: null };
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

export { and, eq, db, users, portfolios, watchlists, chartAnnotations, positions };
