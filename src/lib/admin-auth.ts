import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export const adminCookieName = "moodfood_admin";
const sessionDurationSeconds = 60 * 60 * 12;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(sessionSecret());
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(adminCookieName)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return payload.sub === "admin" && payload.role === "admin";
  } catch {
    return false;
  }
}

export { sessionDurationSeconds };
