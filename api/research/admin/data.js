// GET → every response, newest first. Session required.
import { send } from "../../_lib/http.js";
import { hasSession } from "../../_lib/session.js";
import { db, RESPONSE_COLUMNS } from "../../_lib/db.js";

export default async function handler(req, res) {
  if (!hasSession(req)) return send(res, 401, { error: "Not signed in" });
  if (req.method !== "GET") return send(res, 405, { error: "GET only" });
  try {
    const { rows } = await db().query(`select ${RESPONSE_COLUMNS} from responses order by created_at desc`);
    const leads = (await db().query("select id, email, cohort, created_on from pilot_leads order by created_on desc, email")).rows;
    return send(res, 200, { responses: rows, leads });
  } catch (e) {
    return send(res, 500, { error: "Couldn't load responses." });
  }
}
