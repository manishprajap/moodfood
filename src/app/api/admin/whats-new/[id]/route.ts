import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { whatsNew } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseWhatsNewInput } from "@/app/admin/whats-new";


type RouteContext = { params: Promise<{ id: string }> };

async function readId(context: RouteContext) {
  const { id } = await context.params;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const badId = () => NextResponse.json({ error: "Invalid update id." }, { status: 400 });
const notFound = () => NextResponse.json({ error: "That update no longer exists." }, { status: 404 });

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const id = await readId(context);
  if (!id) return badId();

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
    const [existing] = await db.select({ id: whatsNew.id }).from(whatsNew).where(eq(whatsNew.id, id));
    if (!existing) return notFound();

    await db.update(whatsNew).set(parsed.data).where(eq(whatsNew.id, id));
    const [entry] = await db.select().from(whatsNew).where(eq(whatsNew.id, id));
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Failed to update What's New entry", error);
    return NextResponse.json({ error: "The update could not be saved." }, { status: 500 });
  }
}

// Publish / unpublish without resending the whole entry.
export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const id = await readId(context);
  if (!id) return badId();

  let body: { isPublished?: unknown };
  try {
    body = (await request.json()) as { isPublished?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body.isPublished !== "boolean") {
    return NextResponse.json({ error: "isPublished must be true or false." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const [existing] = await db.select({ id: whatsNew.id }).from(whatsNew).where(eq(whatsNew.id, id));
    if (!existing) return notFound();

    await db.update(whatsNew).set({ isPublished: body.isPublished }).where(eq(whatsNew.id, id));
    const [entry] = await db.select().from(whatsNew).where(eq(whatsNew.id, id));
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Failed to change What's New visibility", error);
    return NextResponse.json({ error: "The update could not be changed." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const id = await readId(context);
  if (!id) return badId();

  try {
    const db = await getDb();
    await db.delete(whatsNew).where(eq(whatsNew.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete What's New entry", error);
    return NextResponse.json({ error: "The update could not be deleted." }, { status: 500 });
  }
}