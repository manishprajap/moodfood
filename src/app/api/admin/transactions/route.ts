import { NextResponse } from "next/server";
import { desc, eq, getTableColumns } from "drizzle-orm";
import { getDb } from "@/db";
import { transactions, orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const rows = await db
      .select({
        ...getTableColumns(transactions),
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
      })
      .from(transactions)
      .leftJoin(orders, eq(transactions.orderId, orders.id))
      .orderBy(desc(transactions.createdAt))
      .limit(500);

    return NextResponse.json({ transactions: rows });
  } catch (error) {
    console.error("Failed to load transactions", error);
    return NextResponse.json({ error: "Transactions could not be loaded." }, { status: 500 });
  }
}