import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "refunded"]).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage orders." }, { status: 401 });
  }
  let input: z.infer<typeof updateSchema>;
  try {
    input = updateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Choose a valid order and payment status." }, { status: 400 });
  }
  try {
    const { id } = await context.params;
    const [existing] = await getDb().select({ id: orders.id }).from(orders).where(eq(orders.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    await getDb().update(orders).set(input).where(eq(orders.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not update order:", error);
    return NextResponse.json({ error: "The order could not be updated." }, { status: 503 });
  }
}
