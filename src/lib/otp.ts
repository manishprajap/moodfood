import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_COOKIE = "mf_otp";
export const SESSION_COOKIE = "mf_session";
export const OTP_TTL_SECONDS = 5 * 60;
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function secret(): string | null {
  if (process.env.OTP_SECRET) return process.env.OTP_SECRET;
  if (process.env.NODE_ENV !== "production") return "dev-only-otp-secret";
  return null;
}

function sign(payload: string): string {
  const key = secret();
  if (!key) throw new Error("OTP_SECRET is not set");
  return createHmac("sha256", key).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

export const isValidIndianMobile = (phone: string) => /^[6-9]\d{9}$/.test(phone);

export const isOtpSecretConfigured = () => secret() !== null;

/** Random 4-digit code, 1000–9999. */
export const generateOtp = () => String(randomInt(1000, 10000));

/**
 * The code itself is never stored. The cookie holds phone + expiry + an HMAC
 * of (phone, expiry, code), so the server stays stateless.
 */
export function createChallenge(phone: string, otp: string): string {
  const exp = nowSeconds() + OTP_TTL_SECONDS;
  const payload = `${phone}.${exp}`;
  return `${payload}.${sign(`${payload}.${otp}`)}`;
}

export function checkChallenge(token: string, phone: string, otp: string): boolean {
  const [tokenPhone, exp, signature] = token.split(".");
  if (!tokenPhone || !exp || !signature) return false;
  if (tokenPhone !== phone) return false;
  if (!Number.isFinite(Number(exp)) || Number(exp) < nowSeconds()) return false;
  return safeEqual(signature, sign(`${tokenPhone}.${exp}.${otp}`));
}

export function createSession(phone: string): string {
  const exp = nowSeconds() + SESSION_TTL_SECONDS;
  return `${phone}.${exp}.${sign(`session.${phone}.${exp}`)}`;
}

/** Returns the phone number if the session token is valid, otherwise null. */
export function readSession(token: string | undefined): string | null {
  if (!token) return null;
  const [phone, exp, signature] = token.split(".");
  if (!phone || !exp || !signature) return null;
  if (Number(exp) < nowSeconds()) return null;
  return safeEqual(signature, sign(`session.${phone}.${exp}`)) ? phone : null;
}