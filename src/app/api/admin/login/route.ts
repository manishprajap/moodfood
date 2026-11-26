import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { getDb } from "@/db";
import { admins } from "@/db/schema";
import {
  adminCookieName,
  createAdminSession,
  sessionDurationSeconds,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body?.password ?? "");

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 },
      );
    }

    // Find admin by email
    const db = getDb();

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    // Admin not found
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    // Verify bcrypt password
    const passwordValid = await bcrypt.compare(
      password,
      admin.passwordHash,
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    // Create secure session token
    const token = await createAdminSession();

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
      { status: 200 },
    );

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: adminCookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: sessionDurationSeconds,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 },
    );
  }
}