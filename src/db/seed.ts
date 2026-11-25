import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { closeDb, getDb } from "./index";
import { products as productRows } from "./schema";
import { products } from "../lib/catalog";

async function seed() {
  const db = getDb();
  let inserted = 0;
  for (const product of products) {
    const [existing] = await db
      .select({ id: productRows.id })
      .from(productRows)
      .where(eq(productRows.slug, product.id))
      .limit(1);
    if (existing) continue;

    await db.insert(productRows).values({
      id: randomUUID(),
      name: product.name,
      slug: product.id,
      category: product.category,
      cuisine: product.cuisine,
      description: product.description,
      price: product.price,
      pack: product.pack,
      weightGrams: product.weightGrams,
      vegetarian: product.vegetarian,
      frozen: product.frozen,
      badge: product.badge ?? null,
      image: product.image,
      ingredients: null,
      nutrition: null,
      isActive: true,
    });
    inserted += 1;
  }
  console.info(`Seeded ${inserted} Mood Food products.`);
}

async function main() {
  try {
    await seed();
  } catch (error) {
    console.error("Mood Food database seed failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

void main();
