// GET ?format=json | ?format=csv&instrument=parents|kids . Session required.
import { send, query } from "../../_lib/http.js";
import { hasSession } from "../../_lib/session.js";
import { db, RESPONSE_COLUMNS } from "../../_lib/db.js";
import { INSTRUMENTS, allQuestions } from "../../../src/research/questions.js";

const cell = (v) => {
  if (v == null) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default async function handler(req, res) {
  if (!hasSession(req)) return send(res, 401, { error: "Not signed in" });
  if (req.method !== "GET") return send(res, 405, { error: "GET only" });
  const { format = "json", instrument } = query(req);
  const stamp = new Date().toISOString().slice(0, 10);
  try {
    if (format === "csv") {
      const inst = INSTRUMENTS[instrument];
      if (!inst) return send(res, 400, { error: "instrument must be parents or kids" });
      const { rows } = await db().query(`select ${RESPONSE_COLUMNS} from responses where instrument=$1 order by created_at desc`, [instrument]);
      const meta = instrument === "parents"
        ? ["id", "status", "cohort", "family_code", "created_at", "completed_at", "email"]
        : ["id", "status", "cohort", "family_code", "created_at", "completed_at", "interviewer", "child_age", "consent"];
      const qids = allQuestions(inst).map((q) => q.id);
      const lines = [[...meta, ...qids].join(",")];
      for (const r of rows) lines.push([...meta.map((m) => cell(r[m] instanceof Date ? r[m].toISOString() : r[m])), ...qids.map((id) => cell(r.answers?.[id]))].join(","));
      return send(res, 200, lines.join("\r\n"), {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lobby-${instrument}-${stamp}.csv"`,
      });
    }
    const { rows } = await db().query(`select ${RESPONSE_COLUMNS} from responses order by created_at desc`);
    return send(res, 200, JSON.stringify({ exported_at: new Date().toISOString(), responses: rows }, null, 2), {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lobby-research-${stamp}.json"`,
    });
  } catch (e) {
    return send(res, 500, { error: "Export failed." });
  }
}
