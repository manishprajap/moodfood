import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { promotions } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage promotions." }, { status: 401 });
  }
  let enabled: boolean;
  try {
    const payload: unknown = await request.json();
    if (typeof payload !== "object" || payload === null || !("enabled" in payload) || typeof payload.enabled !== "boolean") {
      throw new Error("Invalid enabled field.");
    }
    enabled = payload.enabled;
  } catch {
    return NextResponse.json({ error: "A valid enabled value is required." }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const result = await getDb().update(promotions).set({ enabled }).where(eq(promotions.id, id));
    if (result[0].affectedRows === 0) {
      return NextResponse.json({ error: "Promotion not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not update promotion:", error);
    return NextResponse.json({ error: "The promotion could not be updated." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage promotions." }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    await getDb().delete(promotions).where(eq(promotions.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete promotion:", error);
    return NextResponse.json({ error: "The promotion could not be deleted." }, { status: 503 });
  }
}
