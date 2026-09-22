import { createHash } from "node:crypto";

// Fixed-window limiter, in memory only. Fluid Compute reuses instances so this
// holds across requests on a warm function; it is never persisted. The key is a
// salted hash of the IP, so the raw address is not even kept in memory.
const buckets = new Map();

function keyFor(ip, scope) {
  const salt = process.env.RESEARCH_SESSION_SECRET || "dev";
  return createHash("sha256").update(`${scope}|${salt}|${ip}`).digest("base64url");
}

// `peek` checks without counting; a later call without it records the attempt.
export function rateLimit(ip, scope, { limit, windowMs }, { peek = false } = {}) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  const key = keyFor(ip, scope);
  let b = buckets.get(key);
  if (!b || b.reset < now) { b = { count: 0, reset: now + windowMs }; buckets.set(key, b); }
  if (!peek) b.count += 1;
  return { ok: (peek ? b.count + 1 : b.count) <= limit, retryAfter: Math.ceil((b.reset - now) / 1000) };
}
