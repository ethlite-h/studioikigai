// Small helpers so the functions work both on Vercel and under the Vite dev middleware.
export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (body === undefined) return res.end();
  if (typeof body === "string") return res.end(body);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function readJson(req, limit = 256 * 1024) {
  if (req.body !== undefined && req.body !== null && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw Object.assign(new Error("body too large"), { status: 413 });
    chunks.push(c);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

export function query(req) {
  const u = new URL(req.url, "http://x");
  return Object.fromEntries(u.searchParams.entries());
}

export function cookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// The client's address, used only as rate-limit input. Never stored.
export function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(xf) ? xf[0] : xf || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  return ip;
}

export function method(req, ...allowed) {
  return allowed.includes(req.method);
}
