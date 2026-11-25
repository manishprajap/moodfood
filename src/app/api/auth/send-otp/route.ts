import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Mobile OTP delivery is not configured yet. Please contact us on WhatsApp to place an order." },
    { status: 503 },
  );
}
