import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { categoryInput } from "@/lib/admin-validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage categories." }, { status: 401 });
  }

  try {
    const records = await getDb()
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt), desc(categories.id));
    return NextResponse.json({ categories: records });
  } catch (error) {
    console.error("Could not load categories:", error);
    return NextResponse.json(
      { error: "Category storage is unavailable. Check the database setup." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage categories." }, { status: 401 });
  }

  let input: ReturnType<typeof categoryInput.parse>;
  try {
    input = categoryInput.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Enter a valid category name." }, { status: 400 });
  }

  try {
    const db = getDb();
    const [insertResult] = await db.insert(categories).values(input);
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(insertResult.insertId)))
      .limit(1);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Could not create category:", error);
    const duplicate = error instanceof Error && error.message.includes("Duplicate entry");
    return NextResponse.json(
      {
        error: duplicate
          ? "A category with this URL slug already exists."
          : "The category could not be saved.",
      },
      { status: duplicate ? 409 : 503 },
    );
  }
}
