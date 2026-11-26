import { and, eq, inArray } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { orderItems, orders, products } from "@/db/schema";

const orderRequest = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a 10-digit Indian mobile number."),
  deliveryAddress: z.string().trim().min(10).max(2000),
  requestedDeliveryAt: z.iso.datetime(),
  customerNote: z.string().trim().max(1000).nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(2).max(180),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(25)
    .refine(
      (items) => new Set(items.map((item) => item.productId)).size === items.length,
      "Each product may only appear once.",
    ),
});

export async function POST(request: Request) {
  let input: z.infer<typeof orderRequest>;
  try {
    input = orderRequest.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Check your name, mobile number, address, delivery time, and items." },
      { status: 400 },
    );
  }

  const requestedDeliveryAt = new Date(input.requestedDeliveryAt);
  const minimumDeliveryTime = Date.now() + 48 * 60 * 60 * 1000;
  if (requestedDeliveryAt.getTime() < minimumDeliveryTime) {
    return NextResponse.json(
      { error: "Please choose a delivery time at least 48 hours from now." },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    const requestedIds = input.items.map((item) => item.productId);
    const availableProducts = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        price: products.price,
        weightGrams: products.weightGrams,
      })
      .from(products)
      .where(and(inArray(products.slug, requestedIds), eq(products.isActive, true)));

    if (availableProducts.length !== input.items.length) {
      return NextResponse.json(
        { error: "One or more selected products are no longer available. Please refresh the menu." },
        { status: 409 },
      );
    }

    const productBySlug = new Map(availableProducts.map((product) => [product.slug, product]));
    const selected = input.items.map((item) => ({
      item,
      product: productBySlug.get(item.productId)!,
    }));
    const totalWeightGrams = selected.reduce(
      (sum, entry) => sum + entry.product.weightGrams * entry.item.quantity,
      0,
    );
    if (totalWeightGrams < 1000) {
      return NextResponse.json(
        { error: "The minimum order is 1 kg. Please add more to your bag." },
        { status: 400 },
      );
    }

    const subtotal = selected.reduce(
      (sum, entry) => sum + entry.product.price * entry.item.quantity,
      0,
    );
    const dateStamp = new Date().toISOString().slice(2, 10).replaceAll("-", "");
    const orderNumber = `MF${dateStamp}${randomBytes(3).toString("hex").toUpperCase()}`;

    await db.transaction(async (transaction) => {
      const [orderResult] = await transaction.insert(orders).values({
        orderNumber,
        customerName: input.customerName,
        phone: `+91${input.phone}`,
        deliveryAddress: input.deliveryAddress,
        requestedDeliveryAt,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "upi",
        subtotal,
        gstAmount: 0,
        total: subtotal,
        customerNote: input.customerNote?.trim() || null,
      });

      const orderId = Number(orderResult.insertId);
      await transaction.insert(orderItems).values(
        selected.map(({ item, product }) => ({
          orderId,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          lineTotal: product.price * item.quantity,
        })),
      );
    });

    return NextResponse.json({ orderNumber, total: subtotal }, { status: 201 });
  } catch (error) {
    console.error("Could not place order:", error);
    return NextResponse.json(
      { error: "We couldn't save your order. Please try WhatsApp or contact Mood Food." },
      { status: 503 },
    );
  }
}
