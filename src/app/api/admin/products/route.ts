import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { productInput } from "@/lib/admin-validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage products." }, { status: 401 });
  }

  try {
    const records = await getDb()
      .select()
      .from(products)
      .orderBy(desc(products.createdAt), desc(products.id));
    return NextResponse.json({ products: records });
  } catch (error) {
    console.error("Could not load products:", error);
    return NextResponse.json(
      { error: "Product storage is unavailable. Check DATABASE_URL and run the database migrations." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
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
    const db = getDb();
    const [insertResult] = await db.insert(products).values(input);
    const id = Number(insertResult.insertId);
    const [created] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    console.error("Could not create product:", error);
    const duplicate = error instanceof Error && error.message.includes("Duplicate entry");
    return NextResponse.json(
      { error: duplicate ? "That product URL is already in use." : "The product could not be saved." },
      { status: duplicate ? 409 : 503 },
    );
  }
}
