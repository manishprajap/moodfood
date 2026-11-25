import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb } from "@/db";
import { promotions } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { promotionInput } from "@/lib/admin-validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage promotions." }, { status: 401 });
  }
  try {
    const records = await getDb().select().from(promotions).orderBy(asc(promotions.title));
    return NextResponse.json({ promotions: records });
  } catch (error) {
    console.error("Could not load promotions:", error);
    return NextResponse.json({ error: "Promotion storage is unavailable. Check the database setup." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage promotions." }, { status: 401 });
  }
  let input: ReturnType<typeof promotionInput.parse>;
  try {
    input = promotionInput.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Check the promotion details and try again." }, { status: 400 });
  }
  try {
    const id = randomUUID();
    await getDb().insert(promotions).values({ ...input, id });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Could not create promotion:", error);
    return NextResponse.json({ error: "The promotion could not be saved." }, { status: 503 });
  }
}
