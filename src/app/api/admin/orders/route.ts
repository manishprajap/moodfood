import { desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage orders." }, { status: 401 });
  }
  try {
    const db = getDb();
    const records = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt), desc(orders.id));
    const ids = records.map((order) => order.id);
    const items = ids.length
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
      : [];
    const itemsByOrder = new Map<number, typeof items>();
    for (const item of items) {
      const current = itemsByOrder.get(item.orderId) ?? [];
      current.push(item);
      itemsByOrder.set(item.orderId, current);
    }
    return NextResponse.json({
      orders: records.map((order) => ({
        ...order,
        items: itemsByOrder.get(order.id) ?? [],
      })),
    });
  } catch (error) {
    console.error("Could not load orders:", error);
    return NextResponse.json({ error: "Order storage is unavailable. Check the database setup." }, { status: 503 });
  }
}
