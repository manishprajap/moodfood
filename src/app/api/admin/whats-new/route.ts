import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { whatsNew } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseWhatsNewInput } from "@/app/admin/whats-new";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const entries = await db
      .select()
      .from(whatsNew)
      .orderBy(desc(whatsNew.releasedAt), desc(whatsNew.id));
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to load What's New entries", error);
    return NextResponse.json({ error: "What's New entries could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseWhatsNewInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const db = await getDb();
    const [result] = await db.insert(whatsNew).values(parsed.data);
    const [entry] = await db.select().from(whatsNew).where(eq(whatsNew.id, result.insertId));
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Failed to create What's New entry", error);
    return NextResponse.json({ error: "The update could not be saved." }, { status: 500 });
  }
}