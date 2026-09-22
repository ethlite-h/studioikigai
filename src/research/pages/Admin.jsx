import { useEffect, useMemo, useState } from "react";
import { PARENTS, KIDS, MIRRORS, INTERVIEWERS, allQuestions, questionById } from "../questions.js";
import { tally, decide, households, ageBand, bandsPresent, answered, show } from "../analysis.js";
import { api } from "../api.js";
import { navigate } from "../router.js";

const TABS = ["Parents", "Kids", "Households", "Export"];
const when = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "");

export function Admin() {
  const [all, setAll] = useState(null);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Parents");
  const [cohort, setCohort] = useState("");
  const [hideSeed, setHideSeed] = useState(true);

  useEffect(() => {
    api.data().then((d) => { setAll(d.responses); setLeads(d.leads || []); }).catch((e) => {
      if (e.status === 401) navigate("/research/admin/login", { replace: true });
      else setError(e.message);
    });
  }, []);

  const cohorts = useMemo(() => [...new Set((all || []).map((r) => r.cohort).filter(Boolean))].sort(), [all]);
  const rows = useMemo(() => (all || []).filter((r) => (!hideSeed || r.cohort !== "seed") && (!cohort || r.cohort === cohort)), [all, cohort, hideSeed]);
  const parents = rows.filter((r) => r.instrument === "parents" && r.status === "complete");
  const kids = rows.filter((r) => r.instrument === "kids" && r.status === "complete");
  const drafts = rows.filter((r) => r.status === "draft");

  if (error) return <div className="wrap research-page"><p className="form-error">{error}</p></div>;
  if (!all) return <div className="wrap research-page"><p className="thin-note">Loading…</p></div>;

  return (
    <div className="wrap research-page admin">
      <div className="admin-top">
        <div className="admin-stats">
          <Stat n={parents.length} label="parent surveys" />
          <Stat n={kids.length} label="kid interviews" />
          <Stat n={drafts.length} label="in progress" />
        </div>
        <div className="admin-filters">
          <label className="mono small">Cohort
            <select value={cohort} onChange={(e) => setCohort(e.target.value)}>
              <option value="">all</option>
              {cohorts.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="opt small-opt"><input type="checkbox" checked={hideSeed} onChange={(e) => setHideSeed(e.target.checked)} /><span>Exclude seed</span></label>
          <button type="button" className="link-btn" onClick={() => api.logout().then(() => navigate("/research/admin/login", { replace: true }))}>Sign out</button>
        </div>
      </div>
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <button key={t} type="button" className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
      </nav>
      {tab === "Parents" && <ParentsTab rows={parents} drafts={drafts.filter((d) => d.instrument === "parents")} leads={leads.filter((l) => (!hideSeed || l.cohort !== "seed") && (!cohort || l.cohort === cohort))} />}
      {tab === "Kids" && <KidsTab rows={kids} drafts={drafts.filter((d) => d.instrument === "kids")} />}
      {tab === "Households" && <HouseholdsTab parents={parents} kids={kids} />}
      {tab === "Export" && <ExportTab />}
    </div>
  );
}

const Stat = ({ n, label }) => <div className="stat"><span className="stat-n">{n}</span><span className="mono small">{label}</span></div>;

function Decisions({ inst, rows }) {
  return (
    <section className="decisions">
      <h2 className="h4">Decisions</h2>
      <p className="q-help">From the "What each question tests" table. "At risk" means the result that would change the feature set is currently met. Below {8} responses nothing is called.</p>
      <ul>
        {inst.decisions.map((d) => {
          const r = decide(d, rows);
          return (
            <li key={d.decision} className="decision">
              <div className="decision-head">
                <span className="mono small">Q{d.questions.map((id) => questionById(inst, id).n).join(", ")}</span>
                <strong>{d.decision}</strong>
                {r.status && <span className={`status ${r.status.replace(/\s/g, "-")}`}>{r.status}</span>}
              </div>
              <p className="decision-threshold">{d.threshold}</p>
              {r.lines.length > 0 && <ul className="decision-lines">{r.lines.map((l) => <li key={l}>{l}</li>)}</ul>}
              {!r.lines.length && <MiniTallies inst={inst} ids={d.questions} rows={rows} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* Compact tallies for decisions whose threshold is prose: show the numbers, no status. */
function MiniTallies({ inst, ids, rows }) {
  const qs = ids.map((id) => questionById(inst, id)).filter((q) => ["single", "multi", "scale", "gbd", "rank"].includes(q.type));
  if (!qs.length) return null;
  return (
    <div className="decision-lines">
      {qs.map((q) => {
        const t = tally(q, rows);
        return <p key={q.id}>Q{q.n} (n={t.n}): {t.rows.map((r) => q.type === "rank" ? `${r.label} avg ${r.avg?.toFixed(1) ?? "–"}` : `${r.label} ${r.count}`).join(" · ")}</p>;
      })}
    </div>
  );
}

function Bars({ t, mean }) {
  const max = Math.max(1, ...t.rows.map((r) => r.count));
  return (
    <div className="bars">
      {t.rows.map((r) => (
        <div key={r.label} className="bar-row">
          <span className="bar-label">{r.label}</span>
          <span className="bar-track"><i style={{ width: `${(r.count / max) * 100}%` }} /></span>
          <span className="bar-n">{r.count}</span>
        </div>
      ))}
      <p className="q-help">n = {t.n}{mean != null && ` · mean ${mean.toFixed(2)}`}</p>
    </div>
  );
}

function RankTable({ t }) {
  return (
    <table className="rank-table">
      <thead><tr><th>Item</th><th>Avg rank</th><th>First place</th></tr></thead>
      <tbody>{[...t.rows].sort((a, b) => (a.avg ?? 9) - (b.avg ?? 9)).map((r) => <tr key={r.label}><td>{r.label}</td><td>{r.avg?.toFixed(2) ?? "–"}</td><td>{r.first}</td></tr>)}</tbody>
      <tfoot><tr><td colSpan={3} className="q-help">n = {t.n}</td></tr></tfoot>
    </table>
  );
}

function Quotes({ rows, q, meta }) {
  const has = answered(rows, q.id);
  if (!has.length) return <p className="q-help">No answers yet.</p>;
  return (
    <ul className="quotes">
      {has.map((r) => (
        <li key={r.id}>
          <span className="quote-text">{show(q, r.answers[q.id])}</span>
          <span className="mono small">{meta(r)}</span>
        </li>
      ))}
    </ul>
  );
}

function ParentsTab({ rows, drafts, leads }) {
  const meta = (r) => [r.cohort, r.family_code && `family: ${r.family_code}`, when(r.completed_at)].filter(Boolean).join(" · ");
  return (
    <>
      {drafts.length > 0 && (
        <section className="admin-section">
          <h2 className="h4">In progress <span className="mono small">{drafts.length}</span></h2>
          <ul className="quotes">{drafts.map((d) => <li key={d.id}><span className="quote-text">{Object.keys(d.answers || {}).length} answers so far</span><span className="mono small">{[d.cohort, `last saved ${when(d.updated_at)}`].filter(Boolean).join(" · ")}</span></li>)}</ul>
        </section>
      )}
      <Decisions inst={PARENTS} rows={rows} />
      <section className="leads">
        <h2 className="h4">Pilot leads <span className="mono small">{leads.length}</span></h2>
        <p className="q-help">Kept in a separate table with no link to any response, so the surveys stay anonymous.</p>
        {leads.length > 0 && (
          <>
            <button type="button" className="btn ghost" onClick={() => navigator.clipboard.writeText(leads.map((l) => l.email).join(", "))}><span>Copy all emails</span></button>
            <table className="leads-table">
              <thead><tr><th>Email</th><th>Cohort</th><th>Day</th></tr></thead>
              <tbody>{leads.map((l) => <tr key={l.id}><td>{l.email}</td><td>{l.cohort || ""}</td><td>{String(l.created_on).slice(0, 10)}</td></tr>)}</tbody>
            </table>
          </>
        )}
      </section>
      {PARENTS.sections.map((s) => (
        <section key={s.id} className="admin-section">
          <h2 className="h4">{s.n}. {s.title}</h2>
          {s.questions.map((q) => (
            <article key={q.id} className="admin-q">
              <h3><span className="q-n">{q.n}</span> {q.prompt}</h3>
              {["single", "multi", "scale"].includes(q.type) && <Bars t={tally(q, rows)} mean={tally(q, rows).mean} />}
              {q.type === "scale" && q.why && <Quotes rows={rows.filter((r) => r.answers[q.id]?.why)} q={q} meta={meta} />}
              {q.type === "rank" && <RankTable t={tally(q, rows)} />}
              {["short", "long", "number", "kids-roster"].includes(q.type) && <Quotes rows={rows} q={q} meta={meta} />}
            </article>
          ))}
        </section>
      ))}
    </>
  );
}

function KidsTab({ rows, drafts }) {
  const bands = bandsPresent(rows);
  const meta = (r) => [`age ${r.child_age}`, INTERVIEWERS.find((i) => i.id === r.interviewer)?.label || r.interviewer, r.cohort, r.family_code && `family: ${r.family_code}`].filter(Boolean).join(" · ");
  const byBand = (label) => rows.filter((r) => ageBand(r.child_age) === label);
  return (
    <>
      {drafts.length > 0 && (
        <section className="admin-section">
          <h2 className="h4">In progress <span className="mono small">{drafts.length}</span></h2>
          <ul className="quotes">{drafts.map((d) => <li key={d.id}><span className="quote-text">{Object.keys(d.answers || {}).length} answers so far</span><span className="mono small">{[d.child_age && `age ${d.child_age}`, d.cohort, `last saved ${when(d.updated_at)}`].filter(Boolean).join(" · ")}</span></li>)}</ul>
        </section>
      )}
      <Decisions inst={KIDS} rows={rows} />
      <p className="q-help">Every tally is split by age band: {bands.length ? bands.join(", ") : "none yet"}.</p>
      {KIDS.sections.map((s) => (
        <section key={s.id} className="admin-section">
          <h2 className="h4">{s.title}</h2>
          {s.questions.map((q) => (
            <article key={q.id} className="admin-q">
              <h3><span className="q-n">{q.n}</span> {q.prompt}</h3>
              {(q.type === "single" || q.type === "gbd") && (
                <div className="band-grid">
                  {bands.map((b) => (
                    <div key={b} className="band">
                      <p className="mono small">Age {b}</p>
                      <Bars t={tally(q, byBand(b))} />
                    </div>
                  ))}
                </div>
              )}
              {q.type === "gbd" && <Quotes rows={rows.filter((r) => r.answers[q.id]?.said || r.answers[q.id]?.then)} q={q} meta={meta} />}
              {q.type === "long" && <Quotes rows={[...rows].sort((a, b) => a.child_age - b.child_age)} q={q} meta={meta} />}
            </article>
          ))}
        </section>
      ))}
    </>
  );
}

function HouseholdsTab({ parents, kids }) {
  const hh = households(parents, kids);
  if (!hh.length) return <p className="q-help">No family codes yet.</p>;
  return (
    <div className="households">
      {hh.map((h) => (
        <section key={h.code} className="household">
          <h2 className="h4">Family code: {h.code} <span className="mono small">{h.parents.length} parent · {h.kids.length} kid</span></h2>
          {MIRRORS.map((m) => (
            <div key={m.label} className="mirror">
              <p className="mono small">{m.label}</p>
              <div className="mirror-cols">
                <div>
                  {m.parent.map((id) => { const q = questionById(PARENTS, id); return h.parents.map((r) => <p key={r.id + id}><b>Parent Q{q.n}</b> {show(q, r.answers[id]) || <i>blank</i>}</p>); })}
                </div>
                <div>
                  {m.kid.map((id) => { const q = questionById(KIDS, id); return h.kids.map((r) => <p key={r.id + id}><b>Kid Q{q.n} (age {r.child_age})</b> {show(q, r.answers[id]) || <i>blank</i>}</p>); })}
                </div>
              </div>
            </div>
          ))}
          <details className="mirror">
            <summary className="mono small">Everything else</summary>
            <div className="mirror-cols">
              <div>{h.parents.map((r) => allQuestions(PARENTS).map((q) => <p key={r.id + q.id}><b>Q{q.n}</b> {show(q, r.answers[q.id]) || <i>blank</i>}</p>))}</div>
              <div>{h.kids.map((r) => allQuestions(KIDS).map((q) => <p key={r.id + q.id}><b>Q{q.n}</b> {show(q, r.answers[q.id]) || <i>blank</i>}</p>))}</div>
            </div>
          </details>
        </section>
      ))}
    </div>
  );
}

function ExportTab() {
  return (
    <section className="admin-section">
      <h2 className="h4">Export</h2>
      <p className="body">Everything, including drafts and seed rows. One column per question id; structured answers are JSON in the cell.</p>
      <div className="form-nav start">
        <a className="btn ghost" href="/api/research/admin/export?format=csv&instrument=parents"><span>Parents CSV</span></a>
        <a className="btn ghost" href="/api/research/admin/export?format=csv&instrument=kids"><span>Kids CSV</span></a>
        <a className="btn ghost" href="/api/research/admin/export?format=json"><span>Everything JSON</span></a>
      </div>
    </section>
  );
}
