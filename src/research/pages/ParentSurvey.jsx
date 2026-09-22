import { useRef, useState } from "react";
import { PARENTS } from "../questions.js";
import { Field } from "../fields/Field.jsx";
import { api } from "../api.js";
import { navigate, cohortFromUrl } from "../router.js";

// One section per screen, opening straight on section 1. Answers live in memory
// and are also saved to the server as a draft at the end of every section, so an
// abandoned survey still shows what was answered. A reload starts a fresh one.
export function ParentSurvey() {
  const [step, setStep] = useState(1); // 1..n = sections, n+1 = wrap-up
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [family, setFamily] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const draftId = useRef(null);
  const sections = PARENTS.sections;
  const last = sections.length + 1;
  const set = (id) => (v) => setAnswers((a) => ({ ...a, [id]: v }));

  function saveDraft(extra = {}) {
    if (website || !Object.keys(answers).length) return;
    api.draft({ id: draftId.current, instrument: "parents", cohort: cohortFromUrl(), family_code: family, email, answers, ...extra })
      .then((r) => { if (r.id && !draftId.current) draftId.current = r.id; })
      .catch(() => { /* drafts are best-effort; the final submit is what counts */ });
  }

  function next(e) {
    e.preventDefault();
    saveDraft();
    setStep(step + 1);
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      await api.submit({ id: draftId.current, instrument: "parents", cohort: cohortFromUrl(), family_code: family, email, answers, website });
      navigate("/research/thanks");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (step === last) {
    return (
      <form className="wrap research-page narrow" onSubmit={submit}>
        <Progress step={step} total={last} label="Last thing" />
        <h2 className="h4">Two optional things, then you're done.</h2>
        <label className="q-sub">If you'd be up for the pilot, leave an email.
          <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="q-sub">Family code
          <input type="text" value={family} onChange={(e) => setFamily(e.target.value)} placeholder="any word your family picks" autoComplete="off" />
          <span className="q-help">If your kid does the conversation too, use the same word on both forms so the answers can be read together. Nobody else sees it.</span>
        </label>
        <div className="hp" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-nav">
          <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}><span>Back</span></button>
          <button type="submit" className="btn solid" disabled={busy}><span>{busy ? "Sending…" : "Send my answers"}</span><span className="arr">→</span></button>
        </div>
      </form>
    );
  }

  const s = sections[step - 1];
  return (
    <form className="wrap research-page narrow" onSubmit={next} key={s.id}>
      <Progress step={step} total={last} label={`Section ${s.n} of ${sections.length}`} />
      <h2 className="h4">{s.title}</h2>
      {step === 1 && <p className="q-note">Five short sections, about ten minutes. There are no right answers, and you can leave anything blank.</p>}
      {s.note && <p className="q-note">{s.note}</p>}
      {s.questions.map((q) => <Field key={q.id} q={q} value={answers[q.id]} onChange={set(q.id)} />)}
      <div className="form-nav">
        {step > 1 ? <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}><span>Back</span></button> : <span />}
        <button type="submit" className="btn"><span>{step === sections.length ? "Almost done" : "Next"}</span><span className="arr">→</span></button>
      </div>
    </form>
  );
}

function Progress({ step, total, label }) {
  return (
    <div className="progress" aria-label={label}>
      <span className="mono small">{label}</span>
      <div className="progress-bar"><i style={{ width: `${(step / total) * 100}%` }} /></div>
    </div>
  );
}
