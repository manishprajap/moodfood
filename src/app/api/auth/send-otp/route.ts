import { NextResponse } from "next/server";
import {
  OTP_COOKIE,
  OTP_TTL_SECONDS,
  createChallenge,
  generateOtp,
  isOtpSecretConfigured,
  isValidIndianMobile,
} from "@/lib/otp";

const NOT_CONFIGURED =
  "Mobile OTP delivery is not configured yet. Please contact us on WhatsApp to place an order.";

export async function POST(request: Request) {
  let phone = "";
  try {
    const body = (await request.json()) as { phone?: string };
    phone = String(body.phone ?? "").replace(/\D/g, "");
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (!isValidIndianMobile(phone)) {
    return NextResponse.json(
      { message: "Please enter a valid 10-digit mobile number." },
      { status: 400 },
    );
  }

  // There is no SMS provider, so the code can only be shown in demo/dev mode.
  // In production, set OTP_DEMO_MODE=true to keep showing it, or plug an SMS
  // provider into the marked spot below.
  const demoMode =
    process.env.NODE_ENV !== "production" || process.env.OTP_DEMO_MODE === "true";

  if (!demoMode || !isOtpSecretConfigured()) {
    return NextResponse.json({ message: NOT_CONFIGURED }, { status: 503 });
  }

  const otp = generateOtp(); // random 4-digit code, e.g. "1234"

  // --- Plug an SMS provider in here later: send `otp` to +91${phone} ---
  console.log(`[OTP] +91${phone} -> ${otp}`);

  const response = NextResponse.json({
    message: `Demo mode: your sign-in code is ${otp}. It is valid for 5 minutes.`,
  });

  response.cookies.set(OTP_COOKIE, createChallenge(phone, otp), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OTP_TTL_SECONDS,
  });

  return response;
}