// POST /api/research/draft — create or update an in-progress response (either instrument).
// Body: { id (omit to create), instrument, cohort, family_code, answers, child_age, interviewer, consent (kids) }
import { send, readJson, clientIp, method } from "../_lib/http.js";
import { rateLimit } from "../_lib/ratelimit.js";
import { db } from "../_lib/db.js";
import { cleanAnswers, cleanCohort, cleanFamilyCode, cleanKidMeta } from "../_lib/validate.js";

export default async function handler(req, res) {
  if (!method(req, "POST")) return send(res, 405, { error: "POST only" });
  const rl = rateLimit(clientIp(req), "draft", { limit: 240, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) return send(res, 429, { error: "Slow down a little." }, { "Retry-After": rl.retryAfter });
  try {
    const body = await readJson(req);
    if (body.website) return send(res, 200, { ok: true, id: null });
    const instrument = body.instrument === "parents" ? "parents" : "kids";
    const answers = cleanAnswers(instrument, body.answers);
    const cohort = cleanCohort(body.cohort);
    const family_code = cleanFamilyCode(body.family_code);
    const pool = db();
    const validId = typeof body.id === "string" && /^[0-9a-f-]{36}$/.test(body.id);

    if (instrument === "parents") {
      if (validId) {
        const { rows } = await pool.query(
          "update responses set cohort=$2, family_code=$3, updated_at=now(), answers=$4 where id=$1 and instrument='parents' and status='draft' returning id",
          [body.id, cohort, family_code, JSON.stringify(answers)],
        );
        if (rows[0]) return send(res, 200, { ok: true, id: rows[0].id });
      }
      const { rows } = await pool.query(
        "insert into responses (instrument, cohort, family_code, status, answers) values ('parents',$1,$2,'draft',$3) returning id",
        [cohort, family_code, JSON.stringify(answers)],
      );
      return send(res, 200, { ok: true, id: rows[0].id });
    }

    const meta = cleanKidMeta(body, { complete: false });
    if (validId) {
      const { rows } = await pool.query(
        "update responses set cohort=$2, family_code=$3, updated_at=now(), answers=$4, interviewer=$5, child_age=$6, consent=$7 where id=$1 and instrument='kids' and status='draft' returning id",
        [body.id, cohort, family_code, JSON.stringify(answers), meta.interviewer, meta.child_age, meta.consent],
      );
      if (rows[0]) return send(res, 200, { ok: true, id: rows[0].id });
    }
    const { rows } = await pool.query(
      "insert into responses (instrument, cohort, family_code, status, answers, interviewer, child_age, consent) values ('kids',$1,$2,'draft',$3,$4,$5,$6) returning id",
      [cohort, family_code, JSON.stringify(answers), meta.interviewer, meta.child_age, meta.consent],
    );
    return send(res, 200, { ok: true, id: rows[0].id });
  } catch (e) {
    return send(res, e.status || 500, { error: e.status ? e.message : "Couldn't save the draft." });
  }
}
