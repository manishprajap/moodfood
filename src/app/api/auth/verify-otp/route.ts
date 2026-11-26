import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import {
  OTP_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  checkChallenge,
  createSession,
  isValidIndianMobile,
} from "@/lib/otp";

export async function POST(request: NextRequest) {
  let phone = "";
  let code = "";
  try {
    const body = (await request.json()) as { phone?: string; code?: string };
    phone = String(body.phone ?? "").replace(/\D/g, "");
    code = String(body.code ?? "").replace(/\D/g, "");
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (!isValidIndianMobile(phone) || code.length !== 4) {
    return NextResponse.json(
      { verified: false, message: "Enter your mobile number and the 4-digit code." },
      { status: 400 },
    );
  }

  const challenge = request.cookies.get(OTP_COOKIE)?.value;
  if (!challenge) {
    return NextResponse.json(
      { verified: false, message: "This code has expired. Please request a new one." },
      { status: 401 },
    );
  }

  let valid = false;
  try {
    valid = checkChallenge(challenge, phone, code);
  } catch {
    return NextResponse.json(
      { verified: false, message: "Sign-in is not configured yet. Please use WhatsApp." },
      { status: 503 },
    );
  }

  if (!valid) {
    return NextResponse.json(
      { verified: false, message: "That code isn't correct or has expired." },
      { status: 401 },
    );
  }

  const databasePhone = `+91${phone}`;
  try {
    const db = getDb();
    await db
      .insert(customers)
      .values({
        phone: databasePhone,
      })
      .onDuplicateKeyUpdate({
        set: { phone: databasePhone },
      });
  } catch (error) {
    console.error("Could not save verified consumer:", error);
    return NextResponse.json(
      {
        verified: false,
        message: "We couldn't complete sign-in. Please try again.",
      },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ verified: true, message: "You're signed in." });
  response.cookies.delete(OTP_COOKIE); // one-time use
  response.cookies.set(SESSION_COOKIE, createSession(phone), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}