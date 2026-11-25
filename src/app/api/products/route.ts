import { asc, eq } from "drizzle-orm";
import { connection, NextResponse } from "next/server";
import { getDb } from "@/db";
import { products } from "@/db/schema";

export async function GET() {
  await connection();
  try {
    const records = await getDb()
      .select({
        id: products.slug,
        name: products.name,
        category: products.category,
        cuisine: products.cuisine,
        description: products.description,
        price: products.price,
        pack: products.pack,
        weightGrams: products.weightGrams,
        vegetarian: products.vegetarian,
        frozen: products.frozen,
        badge: products.badge,
        image: products.image,
        ingredients: products.ingredients,
        nutrition: products.nutrition,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name));
    return NextResponse.json({ products: records });
  } catch (error) {
    console.error("Could not load storefront products:", error);
    return NextResponse.json(
      { error: "The live menu is temporarily unavailable." },
      { status: 503 },
    );
  }
}
