import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    console.log("TEST - TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL);
    const result = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    return Response.json({ success: true, tables: result });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}