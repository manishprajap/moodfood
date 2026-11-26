import { scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import {
  adminCookieName,
  createAdminSession,
  sessionDurationSeconds,
} from "@/lib/admin-auth";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).toLowerCase(),
  password: z.string().min(1).max(200),
});

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash, extra] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash || extra !== undefined) return false;

  const expectedHash = Buffer.from(hash, "hex");
  if (expectedHash.length !== 64 || expectedHash.toString("hex") !== hash) return false;
  const actualHash = scryptSync(password, salt, expectedHash.length);
  return timingSafeEqual(actualHash, expectedHash);
}

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json(
      { error: "Admin sign-in is not configured. Set ADMIN_SESSION_SECRET to a value at least 32 characters long." },
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

  let admin: { passwordHash: string } | undefined;
  try {
    [admin] = await getDb()
      .select({ passwordHash: admins.passwordHash })
      .from(admins)
      .where(eq(admins.email, input.email))
      .limit(1);
  } catch (error) {
    console.error("Could not verify admin credentials:", error);
    return NextResponse.json({ error: "Admin sign-in is temporarily unavailable." }, { status: 503 });
  }

  if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
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
