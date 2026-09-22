// POST /api/research/submit — a completed parent survey or kid interview.
// Body: { instrument, cohort, family_code, email (parents; stored apart from the answers), answers, website (honeypot),
//         id (optional: finalize an existing draft), child_age, interviewer, consent }
import { send, readJson, clientIp, method } from "../_lib/http.js";
import { rateLimit } from "../_lib/ratelimit.js";
import { db } from "../_lib/db.js";
import { cleanAnswers, cleanCohort, cleanFamilyCode, cleanEmail, cleanKidMeta } from "../_lib/validate.js";

export default async function handler(req, res) {
  if (!method(req, "POST")) return send(res, 405, { error: "POST only" });
  const rl = rateLimit(clientIp(req), "submit", { limit: 12, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) return send(res, 429, { error: "Too many submissions from this connection. Try again later." }, { "Retry-After": rl.retryAfter });
  try {
    const body = await readJson(req);
    if (body.website) return send(res, 200, { ok: true }); // honeypot: pretend, store nothing
    const instrument = body.instrument === "kids" ? "kids" : body.instrument === "parents" ? "parents" : null;
    if (!instrument) return send(res, 400, { error: "Unknown instrument" });
    const answers = cleanAnswers(instrument, body.answers);
    const cohort = cleanCohort(body.cohort);
    const family_code = cleanFamilyCode(body.family_code);
    const pool = db();

    if (instrument === "parents") {
      const email = cleanEmail(body.email);
      // The email goes to its own table with no reference to the response, so the survey stays anonymous.
      if (email) await pool.query("insert into pilot_leads (email, cohort) values ($1, $2)", [email, cohort]);
      if (typeof body.id === "string" && /^[0-9a-f-]{36}$/.test(body.id)) {
        const { rows } = await pool.query(
          "update responses set cohort=$2, family_code=$3, status='complete', completed_at=now(), updated_at=now(), answers=$4 where id=$1 and instrument='parents' and status='draft' returning id",
          [body.id, cohort, family_code, JSON.stringify(answers)],
        );
        if (rows[0]) return send(res, 200, { ok: true, id: rows[0].id });
      }
      const { rows } = await pool.query(
        "insert into responses (instrument, cohort, family_code, status, completed_at, answers) values ('parents',$1,$2,'complete',now(),$3) returning id",
        [cohort, family_code, JSON.stringify(answers)],
      );
      return send(res, 200, { ok: true, id: rows[0].id });
    }

    const meta = cleanKidMeta(body, { complete: true });
    if (typeof body.id === "string" && /^[0-9a-f-]{36}$/.test(body.id)) {
      const { rows } = await pool.query(
        "update responses set cohort=$2, family_code=$3, status='complete', completed_at=now(), updated_at=now(), answers=$4, interviewer=$5, child_age=$6, consent=$7 where id=$1 and instrument='kids' and status='draft' returning id",
        [body.id, cohort, family_code, JSON.stringify(answers), meta.interviewer, meta.child_age, meta.consent],
      );
      if (rows[0]) return send(res, 200, { ok: true, id: rows[0].id });
    }
    const { rows } = await pool.query(
      "insert into responses (instrument, cohort, family_code, status, completed_at, answers, interviewer, child_age, consent) values ('kids',$1,$2,'complete',now(),$3,$4,$5,$6) returning id",
      [cohort, family_code, JSON.stringify(answers), meta.interviewer, meta.child_age, meta.consent],
    );
    return send(res, 200, { ok: true, id: rows[0].id });
  } catch (e) {
    return send(res, e.status || 500, { error: e.status ? e.message : "Something went wrong saving that. Please try again." });
  }
}
