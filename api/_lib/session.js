import { createHmac, createHash, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "./http.js";

export const COOKIE = "research_session";
const WEEK = 7 * 24 * 60 * 60;

function secret() {
  const s = process.env.RESEARCH_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("RESEARCH_SESSION_SECRET is not set");
  return s;
}

function sign(data) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function safeEqual(a, b) {
  // Hash both sides first so lengths never leak and buffers always match in size.
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(given) {
  const expected = process.env.RESEARCH_ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(given || "", expected);
}

export function issueCookie() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + WEEK, n: randomBytes(8).toString("hex") })).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${WEEK}${secure}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function hasSession(req) {
  const raw = cookies(req)[COOKIE];
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  if (i < 0) return false;
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  try {
    if (!safeEqual(sig, sign(payload))) return false;
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
