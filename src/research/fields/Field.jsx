import { useId } from "react";
import { optionLabel, GBD } from "../questions.js";

/* Renders one question from questions.js. `value` is the answer in the shape
   documented there; `onChange(next)` replaces it. Interviewer notes (`help`)
   are shown muted under the prompt. */
export function Field({ q, value, onChange, kid = false }) {
  const id = useId();
  return (
    <fieldset className={`q q-${q.type}`} id={q.id}>
      <legend>
        <span className="q-n">{q.n}</span>
        <span className="q-prompt">{q.prompt}</span>
      </legend>
      {q.help && <p className="q-help">{q.help}</p>}
      <Input q={q} value={value} onChange={onChange} id={id} kid={kid} />
    </fieldset>
  );
}

function Input({ q, value, onChange, id, kid }) {
  switch (q.type) {
    case "single": return <Single q={q} value={value} onChange={onChange} id={id} />;
    case "multi": return <Multi q={q} value={value} onChange={onChange} id={id} />;
    case "scale": return <Scale q={q} value={value} onChange={onChange} id={id} />;
    case "rank": return <Rank q={q} value={value} onChange={onChange} id={id} />;
    case "short": return q.repeat
      ? <div className="q-lines">{Array.from({ length: q.repeat }, (_, i) => (
          <input key={i} type="text" aria-label={`${q.prompt} ${i + 1}`} value={value?.[i] || ""} onChange={(e) => { const n = [...(value || Array(q.repeat).fill(""))]; n[i] = e.target.value; onChange(n); }} />
        ))}</div>
      : <input type="text" aria-label={q.prompt} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    case "long": return <textarea aria-label={q.prompt} rows={kid ? 4 : 3} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    case "number": return <input type="number" inputMode="numeric" aria-label={q.prompt} min={q.min} max={q.max} className="q-num" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
    case "kids-roster": return <Roster value={value} onChange={onChange} />;
    case "gbd": return <Gbd q={q} value={value} onChange={onChange} id={id} />;
    case "names": return <Names q={q} value={value} onChange={onChange} />;
    default: return null;
  }
}

function Single({ q, value, onChange, id }) {
  const otherOpt = q.options.find((o) => o.other);
  const otherSel = otherOpt && typeof value === "string" && value.startsWith("Other");
  return (
    <div className="q-options" role="radiogroup" aria-labelledby={q.id}>
      {q.options.map((o, i) => {
        const label = optionLabel(o);
        const selected = o.other ? otherSel : value === label;
        return (
          <label key={label} className={`opt ${selected ? "on" : ""}`}>
            <input type="radio" name={id} checked={!!selected} onChange={() => onChange(o.other ? "Other: " : label)} />
            <span>{o.other ? "Other:" : label}</span>
            {o.other && selected && (
              <input type="text" className="opt-other" aria-label="Other" autoFocus value={value.replace(/^Other:\s?/, "")} onChange={(e) => onChange(`Other: ${e.target.value}`)} onClick={(e) => e.preventDefault()} />
            )}
          </label>
        );
      })}
    </div>
  );
}

function Multi({ q, value = [], onChange }) {
  const picks = Array.isArray(value) ? value : [];
  const full = q.max && picks.length >= q.max;
  return (
    <div className="q-options">
      {q.options.map((o) => {
        const label = optionLabel(o);
        const on = picks.includes(label);
        return (
          <label key={label} className={`opt ${on ? "on" : ""} ${!on && full ? "dim" : ""}`}>
            <input type="checkbox" checked={on} disabled={!on && full} onChange={() => onChange(on ? picks.filter((p) => p !== label) : [...picks, label])} />
            <span>{label}</span>
          </label>
        );
      })}
      {q.max && <p className="q-help">{picks.length} of {q.max} picked</p>}
    </div>
  );
}

function Scale({ q, value, onChange, id }) {
  const rating = value?.rating ?? null;
  return (
    <div className="q-scale">
      <div className="scale-row" role="radiogroup" aria-label="1 to 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`scale-btn ${rating === n ? "on" : ""}`}>
            <input type="radio" name={id} checked={rating === n} onChange={() => onChange({ ...value, rating: n })} />
            <span>{n}</span>
          </label>
        ))}
      </div>
      <div className="scale-ends mono small"><span>Wouldn't use</span><span>Every week</span></div>
      {q.why && <input type="text" placeholder="One line on why" aria-label="Why" value={value?.why || ""} onChange={(e) => onChange({ ...value, why: e.target.value })} />}
    </div>
  );
}

/* Tap items in order, most important first. Tapping a ranked item clears it and everything after it. */
function Rank({ q, value = [], onChange }) {
  const order = Array.isArray(value) ? value : [];
  const set = (itemId, pos) => {
    const rest = order.filter((x) => x !== itemId);
    if (pos === "") return onChange(rest);
    const n = Math.max(0, Math.min(rest.length, pos - 1));
    onChange([...rest.slice(0, n), itemId, ...rest.slice(n)]);
  };
  return (
    <div className="q-rank">
      <p className="q-help">Tap in order of importance, or pick a number for each. 1 is the most important.</p>
      <ol>
        {q.items.map((it) => {
          const pos = order.indexOf(it.id);
          return (
            <li key={it.id} className={pos >= 0 ? "on" : ""}>
              <button type="button" className="rank-tap" aria-label={`${it.label}: ${pos >= 0 ? `ranked ${pos + 1}` : "unranked"}`}
                onClick={() => (pos >= 0 ? onChange(order.slice(0, pos)) : onChange([...order, it.id]))}>
                <span className="rank-badge">{pos >= 0 ? pos + 1 : ""}</span>
                <span>{it.label}</span>
              </button>
              <select aria-label={`Rank for ${it.label}`} value={pos >= 0 ? pos + 1 : ""} onChange={(e) => set(it.id, e.target.value === "" ? "" : Number(e.target.value))}>
                <option value="">–</option>
                {q.items.map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Roster({ value, onChange }) {
  const ages = Array.isArray(value) ? value : [];
  return (
    <div className="q-roster">
      {ages.map((a, i) => (
        <div key={i} className="roster-row">
          <label>Kid {i + 1}, age
            <input type="number" inputMode="numeric" min={0} max={20} className="q-num" value={a ?? ""} onChange={(e) => { const n = [...ages]; n[i] = e.target.value === "" ? "" : Number(e.target.value); onChange(n); }} />
          </label>
          <button type="button" className="link-btn" onClick={() => onChange(ages.filter((_, j) => j !== i))}>remove</button>
        </div>
      ))}
      {ages.length < 8 && <button type="button" className="btn ghost" onClick={() => onChange([...ages, ""])}><span>{ages.length ? "Add another kid" : "Add a kid"}</span></button>}
    </div>
  );
}

function Gbd({ q, value = {}, onChange, id }) {
  return (
    <div className="q-gbd">
      <div className="gbd-row" role="radiogroup" aria-label="good, bad, or don't care">
        {GBD.map((g) => (
          <label key={g.id} className={`gbd-btn ${value.choice === g.id ? "on" : ""}`}>
            <input type="radio" name={id} checked={value.choice === g.id} onChange={() => onChange({ ...value, choice: g.id })} />
            <span>{g.label}</span>
          </label>
        ))}
      </div>
      <label className="q-sub">What they said next
        <textarea rows={2} value={value.said || ""} onChange={(e) => onChange({ ...value, said: e.target.value })} />
      </label>
      {q.then && (
        <label className="q-sub">Then: {q.then}
          <textarea rows={2} value={value.then || ""} onChange={(e) => onChange({ ...value, then: e.target.value })} />
        </label>
      )}
    </div>
  );
}

function Names({ q, value = {}, onChange }) {
  return (
    <div className="q-names">
      {q.suggest && (
        <label className="q-sub q-suggest">{q.suggest}
          <input type="text" value={value.suggestion || ""} onChange={(e) => onChange({ ...value, suggestion: e.target.value })} placeholder="their idea, in their words" />
        </label>
      )}
      {q.names.map((n) => (
        <div key={n} className="name-card">
          <p className="h4">{n}</p>
          <label className="q-sub">Reaction, in their words
            <textarea rows={2} value={value[n]?.reaction || ""} onChange={(e) => onChange({ ...value, [n]: { ...value[n], reaction: e.target.value } })} />
          </label>
          <label className="q-sub">The face
            <input type="text" value={value[n]?.face || ""} onChange={(e) => onChange({ ...value, [n]: { ...value[n], face: e.target.value } })} />
          </label>
        </div>
      ))}
    </div>
  );
}
