import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminCookieName,
  createAdminSession,
  sessionDurationSeconds,
} from "@/lib/admin-auth";

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

function matchesConfiguredValue(actual: string, expected: string) {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!adminEmail || !adminPassword || !secret || secret.length < 32) {
    return NextResponse.json(
      { error: "Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET." },
      { status: 503 },
    );
  }

  let input: z.infer<typeof credentialsSchema>;
  try {
    const payload: unknown = await request.json();
    input = credentialsSchema.parse(payload);
  } catch {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const emailMatches = matchesConfiguredValue(
    input.email.toLowerCase(),
    adminEmail.toLowerCase(),
  );
  const passwordMatches = matchesConfiguredValue(input.password, adminPassword);
  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  try {
    const token = await createAdminSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: sessionDurationSeconds,
    });
    return response;
  } catch (error) {
    console.error("Could not create admin session:", error);
    return NextResponse.json({ error: "Admin session could not be created." }, { status: 500 });
  }
}
