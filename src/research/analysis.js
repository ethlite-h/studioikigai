import { optionLabel, AGE_BANDS, MIN_N, GBD } from "./questions.js";

export const answered = (rows, id) => rows.filter((r) => {
  const v = r.answers?.[id];
  if (v == null || v === "") return false;
  if (Array.isArray(v)) return v.some((x) => x !== "" && x != null);
  if (typeof v === "object") return v.rating != null || v.choice || Object.values(v).some((x) => typeof x === "string" && x.trim());
  return true;
});

export function ageBand(age) {
  const b = AGE_BANDS.find((b) => age >= b.min && age <= b.max);
  return b ? b.label : age == null ? "no age" : String(age);
}
export function bandsPresent(rows) {
  const seen = new Set(rows.map((r) => ageBand(r.child_age)));
  return [...AGE_BANDS.map((b) => b.label).filter((l) => seen.has(l)), ...[...seen].filter((l) => !AGE_BANDS.some((b) => b.label === l)).sort()];
}

/* Counts per option for single/multi; per 1–5 for scale; per choice for gbd. */
export function tally(q, rows) {
  const has = answered(rows, q.id);
  const n = has.length;
  if (q.type === "single" || q.type === "multi") {
    const labels = q.options.map((o) => (o.other ? "Other" : optionLabel(o)));
    const counts = Object.fromEntries(labels.map((l) => [l, 0]));
    for (const r of has) {
      const v = r.answers[q.id];
      for (const x of Array.isArray(v) ? v : [v]) counts[typeof x === "string" && x.startsWith("Other") ? "Other" : x] = (counts[typeof x === "string" && x.startsWith("Other") ? "Other" : x] || 0) + 1;
    }
    return { n, rows: labels.map((l) => ({ label: l, count: counts[l] || 0 })) };
  }
  if (q.type === "scale") {
    const counts = [1, 2, 3, 4, 5].map((k) => ({ label: String(k), count: has.filter((r) => r.answers[q.id]?.rating === k).length }));
    const rated = has.filter((r) => r.answers[q.id]?.rating != null);
    const mean = rated.length ? rated.reduce((s, r) => s + r.answers[q.id].rating, 0) / rated.length : null;
    return { n: rated.length, rows: counts, mean };
  }
  if (q.type === "gbd") {
    return { n, rows: GBD.map((g) => ({ label: g.label, id: g.id, count: has.filter((r) => r.answers[q.id]?.choice === g.id).length })) };
  }
  if (q.type === "rank") {
    const rows2 = q.items.map((it) => {
      const positions = has.map((r) => r.answers[q.id].indexOf(it.id)).filter((p) => p >= 0).map((p) => p + 1);
      return { label: it.label, avg: positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null, first: positions.filter((p) => p === 1).length, count: positions.length };
    });
    return { n, rows: rows2 };
  }
  return { n, rows: [] };
}

export function share(rows, id, values) {
  const has = answered(rows, id);
  const vals = Array.isArray(values) ? values : [values];
  const hit = has.filter((r) => vals.includes(r.answers[id])).length;
  return { hit, n: has.length, share: has.length ? hit / has.length : null };
}
const pct = (s) => (s.share == null ? "–" : `${Math.round(s.share * 100)}%`);
const fmt = (label, s) => `${label}: ${s.hit} of ${s.n} (${pct(s)})`;

/* Turns a decision row into { status, lines }. status is null when the file's
   threshold isn't numeric; otherwise "holds" | "at risk" | "too few responses".
   "at risk" means the file's "result that changes the feature set" is currently met. */
export function decide(d, rows) {
  const status = (n, met) => (n < MIN_N ? "too few responses" : met ? "at risk" : "holds");
  switch (d.compute) {
    case "brand-and-mac": {
      const brand = share(rows, "p4", "Full YouTube on a channel under my Google account");
      const mac = share(rows, "p5", "Yes");
      return { status: status(Math.min(brand.n, mac.n), brand.share < 0.5 || mac.share < 0.5), lines: [fmt("Brand account (channel under my Google account)", brand), fmt("Has a Mac", mac)] };
    }
    case "confident-naming": {
      const very = share(rows, "p9", "Very");
      const named3 = answered(rows, "p8").filter((r) => (r.answers.p8 || []).filter((x) => x && x.trim()).length === 3).length;
      return { status: status(very.n, very.share > 0.5), lines: [fmt("\"Very\" confident", very), `Named all three: ${named3} of ${answered(rows, "p8").length}`] };
    }
    case "limit-and-block": {
      const limit = share(rows, "p15", "limit what they're watching");
      const know = share(rows, "p15", "know what they're watching");
      const block = share(rows, "p17", "block the stuff you don't like");
      const own = share(rows, "p17", "get your own stuff into their feed");
      const met = limit.hit > know.hit && block.hit > own.hit;
      return { status: status(Math.min(limit.n, block.n), met), lines: [`Q15 limit ${limit.hit} vs know ${know.hit}`, `Q17 block ${block.hit} vs get your own stuff in ${own.hit}`] };
    }
    case "majority": {
      const s = share(rows, d.of, d.value);
      return { status: status(s.n, s.share > 0.5), lines: [fmt(`"${d.value}"`, s)] };
    }
    case "majority-any": {
      const s = share(rows, d.of, d.values);
      return { status: status(s.n, s.share > 0.5), lines: [fmt(d.values.map((v) => `"${v}"`).join(" or "), s)] };
    }
    case "weekly-refused": {
      const yes = share(rows, "p32", "Yes");
      const refused = { hit: yes.n - yes.hit, n: yes.n, share: yes.n ? (yes.n - yes.hit) / yes.n : null };
      return { status: status(yes.n, refused.share > 0.5), lines: [fmt("Won't re-export weekly (monthly at most, or must be automatic)", refused)] };
    }
    case "blank8-good16": {
      const blank8 = rows.filter((r) => { const v = r.answers?.k8; return !v || !v.trim() || /^\(?\s*blank/i.test(v.trim()); });
      const both = blank8.filter((r) => r.answers?.k16?.choice === "good").length;
      return { status: null, lines: [`Blank on Q8: ${blank8.length} of ${rows.length}`, `Blank on Q8 and "good" on Q16: ${both}`] };
    }
    default:
      return { status: null, lines: [] };
  }
}

export const normCode = (c) => (c || "").trim().toLowerCase();

export function households(parents, kids) {
  const map = new Map();
  for (const r of [...parents, ...kids]) {
    const k = normCode(r.family_code);
    if (!k) continue;
    if (!map.has(k)) map.set(k, { code: k, parents: [], kids: [] });
    map.get(k)[r.instrument].push(r);
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}

/* Plain-text rendering of any answer, for lists and the households view. */
export function show(q, v) {
  if (v == null || v === "") return "";
  switch (q.type) {
    case "multi": return v.join(", ");
    case "scale": return v.rating != null ? `${v.rating}/5${v.why ? ` — ${v.why}` : ""}` : v.why || "";
    case "rank": return v.map((id, i) => `${i + 1}. ${q.items.find((it) => it.id === id)?.label || id}`).join("  ");
    case "kids-roster": return v.length ? v.map((a) => `age ${a}`).join(", ") : "";
    case "short": return Array.isArray(v) ? v.filter(Boolean).join(", ") : v;
    case "gbd": return [GBD.find((g) => g.id === v.choice)?.label, v.said, v.then && `Then: ${v.then}`].filter(Boolean).join(" — ");
    case "names": return Object.entries(v).map(([n, r]) => `${n}: ${r.reaction || ""}${r.face ? ` (${r.face})` : ""}`).join("  ·  ");
    default: return String(v);
  }
}
