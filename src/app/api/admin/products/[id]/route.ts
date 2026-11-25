import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { productInput } from "@/lib/admin-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage products." }, { status: 401 });
  }

  let input: ReturnType<typeof productInput.parse>;
  try {
    input = productInput.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Check the product details and try again." }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    await getDb().update(products).set(input).where(eq(products.id, id));
    const [updated] = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
    if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Could not update product:", error);
    const duplicate = error instanceof Error && error.message.includes("Duplicate entry");
    return NextResponse.json(
      { error: duplicate ? "That product URL is already in use." : "The product could not be updated." },
      { status: duplicate ? 409 : 503 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage products." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await getDb().delete(products).where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete product:", error);
    return NextResponse.json({ error: "The product could not be deleted." }, { status: 503 });
  }
}
