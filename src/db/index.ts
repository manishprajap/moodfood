import { createPool, type Pool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

type DatabaseGlobal = typeof globalThis & { moodFoodPool?: Pool };

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const globalForDb = globalThis as DatabaseGlobal;
  const pool =
    globalForDb.moodFoodPool ??
    createPool({
      uri: connectionString,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.moodFoodPool = pool;
  }

  return drizzle(pool, { schema, mode: "default" });
}

export async function closeDb() {
  const globalForDb = globalThis as DatabaseGlobal;
  const pool = globalForDb.moodFoodPool;
  if (!pool) return;
  await pool.end();
  delete globalForDb.moodFoodPool;
}
