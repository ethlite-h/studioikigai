// POST { password } → session cookie. DELETE → clear it. GET → { ok } if the session is valid.
import { send, readJson, clientIp } from "../../_lib/http.js";
import { rateLimit } from "../../_lib/ratelimit.js";
import { checkPassword, issueCookie, clearCookie, hasSession } from "../../_lib/session.js";

export default async function handler(req, res) {
  if (req.method === "GET") return send(res, hasSession(req) ? 200 : 401, { ok: hasSession(req) });
  if (req.method === "DELETE") return send(res, 200, { ok: true }, { "Set-Cookie": clearCookie() });
  if (req.method !== "POST") return send(res, 405, { error: "POST only" });
  const opts = { limit: 5, windowMs: 15 * 60 * 1000 }; // failed attempts only
  const rl = rateLimit(clientIp(req), "login", opts, { peek: true });
  if (!rl.ok) return send(res, 429, { error: "Too many attempts. Wait a few minutes." }, { "Retry-After": rl.retryAfter });
  try {
    const { password } = await readJson(req);
    if (!checkPassword(password)) {
      rateLimit(clientIp(req), "login", opts);
      return send(res, 401, { error: "Wrong password." });
    }
    return send(res, 200, { ok: true }, { "Set-Cookie": issueCookie() });
  } catch (e) {
    return send(res, 500, { error: "Login failed." });
  }
}
