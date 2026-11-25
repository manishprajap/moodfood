import { and, asc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { connection, NextResponse } from "next/server";
import { getDb } from "@/db";
import { promotions } from "@/db/schema";

export async function GET() {
  await connection();
  try {
    const now = new Date();
    const records = await getDb()
      .select({
        title: promotions.title,
        code: promotions.code,
        message: promotions.message,
      })
      .from(promotions)
      .where(
        and(
          eq(promotions.enabled, true),
          or(isNull(promotions.startsAt), lte(promotions.startsAt, now)),
          or(isNull(promotions.endsAt), gt(promotions.endsAt, now)),
        ),
      )
      .orderBy(asc(promotions.title));
    return NextResponse.json({ promotions: records });
  } catch (error) {
    console.error("Could not load storefront promotions:", error);
    return NextResponse.json(
      { error: "Promotions are temporarily unavailable." },
      { status: 503 },
    );
  }
}
