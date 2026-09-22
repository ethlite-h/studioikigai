import { INSTRUMENTS, allQuestions, optionLabel, INTERVIEWERS, GBD } from "../../src/research/questions.js";

const TEXT = 4000;
const err = (msg) => Object.assign(new Error(msg), { status: 400 });
const str = (v, max = TEXT) => (typeof v === "string" ? v.slice(0, max) : "");

export function cleanCohort(v) {
  return str(v, 40).trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") || null;
}
export function cleanFamilyCode(v) {
  return str(v, 60).trim() || null;
}
export function cleanEmail(v) {
  const s = str(v, 200).trim();
  if (!s) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw err("That email doesn't look right.");
  return s;
}

function cleanOne(q, v) {
  const labels = (q.options || []).map(optionLabel);
  switch (q.type) {
    case "single": {
      const s = str(v, 300);
      if (!s) return "";
      if (labels.includes(s)) return s;
      if (q.options?.some((o) => o.other) && s.startsWith("Other")) return s;
      throw err(`Unexpected answer for ${q.id}`);
    }
    case "multi": {
      if (!Array.isArray(v)) return [];
      const picks = [...new Set(v.filter((x) => labels.includes(x)))];
      return q.max ? picks.slice(0, q.max) : picks;
    }
    case "scale": {
      const rating = Number(v?.rating ?? v);
      return { rating: rating >= 1 && rating <= 5 ? Math.round(rating) : null, why: str(v?.why, 1000) };
    }
    case "rank": {
      if (!Array.isArray(v)) return [];
      const ids = q.items.map((i) => i.id);
      return [...new Set(v.filter((x) => ids.includes(x)))];
    }
    case "short":
      if (q.repeat) return Array.from({ length: q.repeat }, (_, i) => str(Array.isArray(v) ? v[i] : "", 200));
      return str(v, 200);
    case "long":
      return str(v);
    case "number": {
      const n = Number(v);
      if (v === "" || v == null || !Number.isFinite(n)) return null;
      if (q.min != null && n < q.min) return null;
      if (q.max != null && n > q.max) return null;
      return Math.round(n);
    }
    case "kids-roster":
      return (Array.isArray(v) ? v : []).map(Number).filter((n) => Number.isFinite(n) && n >= 0 && n <= 20).slice(0, 8);
    case "gbd":
      return { choice: GBD.some((g) => g.id === v?.choice) ? v.choice : "", said: str(v?.said), then: q.then ? str(v?.then) : "" };
    case "names": {
      const out = Object.fromEntries(q.names.map((n) => [n, { reaction: str(v?.[n]?.reaction, 1000), face: str(v?.[n]?.face, 500) }]));
      if (q.suggest) out.suggestion = str(v?.suggestion, 300);
      return out;
    }
    default:
      throw err(`Unknown question type ${q.type}`);
  }
}

export function cleanAnswers(instrumentId, answers) {
  const inst = INSTRUMENTS[instrumentId];
  if (!inst) throw err("Unknown instrument");
  const out = {};
  const given = answers && typeof answers === "object" ? answers : {};
  for (const q of allQuestions(inst)) if (q.id in given) out[q.id] = cleanOne(q, given[q.id]);
  return out;
}

export function cleanKidMeta(body, { complete }) {
  const age = Number(body.child_age);
  const interviewer = INTERVIEWERS.some((i) => i.id === body.interviewer) ? body.interviewer : null;
  const consent = body.consent === true;
  if (complete) {
    if (!(age >= 5 && age <= 14)) throw err("The child's age must be between 5 and 14.");
    if (!interviewer) throw err("Say who is running the interview.");
    if (!consent) throw err("The interview can't be saved without the parent's permission box ticked.");
  }
  return { child_age: age >= 5 && age <= 14 ? Math.round(age) : null, interviewer, consent };
}
