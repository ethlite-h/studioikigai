import { useEffect, useRef, useState } from "react";
import { KIDS, INTERVIEWERS } from "../questions.js";
import { Field } from "../fields/Field.jsx";
import { api } from "../api.js";
import { navigate, cohortFromUrl } from "../router.js";

const AUTOSAVE_MS = 30_000;

// The interviewer's capture tool: one long page, autosaved to the server as a draft.
export function KidInterview() {
  const [meta, setMeta] = useState({ child_age: "", interviewer: "", consent: false, family_code: "" });
  const [answers, setAnswers] = useState({});
  const [website, setWebsite] = useState("");
  const [draftId, setDraftId] = useState(null);
  const [saved, setSaved] = useState("");   // status line
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);
  const latest = useRef({ meta, answers, draftId });
  latest.current = { meta, answers, draftId };
  const set = (id) => (v) => { dirty.current = true; setAnswers((a) => ({ ...a, [id]: v })); };
  const setM = (k) => (v) => { dirty.current = true; setMeta((m) => ({ ...m, [k]: v })); };

  async function saveDraft() {
    const { meta, answers, draftId } = latest.current;
    if (!dirty.current || website) return;
    if (!Object.keys(answers).length && !meta.child_age) return;
    dirty.current = false;
    try {
      const r = await api.draft({ id: draftId, cohort: cohortFromUrl(), family_code: meta.family_code, answers, child_age: meta.child_age, interviewer: meta.interviewer, consent: meta.consent });
      if (r.id && !latest.current.draftId) setDraftId(r.id);
      setSaved(`Draft saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    } catch (e) {
      dirty.current = true;
      setSaved("Couldn't save the draft; will retry.");
    }
  }

  useEffect(() => {
    const t = setInterval(saveDraft, AUTOSAVE_MS);
    const warn = (e) => { if (dirty.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => { clearInterval(t); window.removeEventListener("beforeunload", warn); };
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!(Number(meta.child_age) >= 5 && Number(meta.child_age) <= 14)) return setError("Enter the child's age, 5 to 14.");
    if (!meta.interviewer) return setError("Say who is running the interview.");
    if (!meta.consent) return setError("Tick the permission box before saving.");
    setBusy(true);
    try {
      await api.submit({ instrument: "kids", id: draftId, cohort: cohortFromUrl(), family_code: meta.family_code, answers, child_age: Number(meta.child_age), interviewer: meta.interviewer, consent: meta.consent, website });
      dirty.current = false;
      navigate(`/research/thanks${cohortFromUrl() ? `?c=${cohortFromUrl()}` : ""}`, { state: { from: "kids" } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="wrap research-page kid" onSubmit={submit} onBlur={() => saveDraft()}>
      <p className="mono kicker">Kid interview · 7–12 · about 15 minutes</p>
      <h1 className="h3 display">{KIDS.title}</h1>
      <p className="body">{KIDS.intro}</p>

      <details className="howto">
        <summary className="mono">{KIDS.howTo.title}</summary>
        <p className="body">{KIDS.howTo.body}</p>
        <ul className="body">{KIDS.howTo.rules.map((r) => <li key={r}>{r}</li>)}</ul>
      </details>

      <section className="kid-meta">
        <label className="q-sub">Kid's age
          <input type="number" inputMode="numeric" min={5} max={14} required className="q-num" value={meta.child_age} onChange={(e) => setM("child_age")(e.target.value)} />
        </label>
        <div className="q-sub">
          <span>Interviewer</span>
          <div className="q-options row">
            {INTERVIEWERS.map((i) => (
              <label key={i.id} className={`opt ${meta.interviewer === i.id ? "on" : ""}`}>
                <input type="radio" name="interviewer" checked={meta.interviewer === i.id} onChange={() => setM("interviewer")(i.id)} /><span>{i.label}</span>
              </label>
            ))}
          </div>
        </div>
        <label className="q-sub">Family code
          <input type="text" value={meta.family_code} onChange={(e) => setM("family_code")(e.target.value)} placeholder="any word the family picks" autoComplete="off" />
          <span className="q-help">Same word the parent used on their survey, so the two can be read together. Not the child's name.</span>
        </label>
        <label className={`opt consent ${meta.consent ? "on" : ""}`}>
          <input type="checkbox" checked={meta.consent} onChange={(e) => setM("consent")(e.target.checked)} />
          <span>I am this child's parent or have their parent's permission for this conversation.</span>
        </label>
      </section>

      {KIDS.sections.map((s) => (
        <section key={s.id} className="kid-part">
          <h2 className="h4">{s.title}</h2>
          {s.note && <p className="q-note">{s.note}</p>}
          {s.questions.map((q) => <Field key={q.id} q={q} value={answers[q.id]} onChange={set(q.id)} kid />)}
        </section>
      ))}

      <div className="hp" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-nav">
        <span className="thin-note">{saved || "Autosaves every 30 seconds"}</span>
        <button type="submit" className="btn seal" disabled={busy}><span>{busy ? "Saving…" : "Save interview"}</span><span className="arr">→</span></button>
      </div>
    </form>
  );
}
