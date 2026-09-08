import { useMemo, useState } from "react";
import { Reveal, Words } from "../lib/Reveal.jsx";

/* The essay's arithmetic, made draggable:
   10,000 users × $10/month = $1.2M a year. Split three ways. No board. */
const fmt = (n) => n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : `$${Math.round(n / 1000)}k`;
const BIG_TECH_BAR = 100_000_000; // what it takes for a big-tech roadmap to notice

export function MathSection() {
  const [users, setUsers] = useState(10000);
  const [price, setPrice] = useState(10);
  const [team, setTeam] = useState(1);

  const { annual, each, pct } = useMemo(() => {
    const annual = users * price * 12;
    const infra = Math.max(600, users * 0.4); // on-device: near-zero marginal cost
    const each = (annual * 0.7 - infra) / team; // after store cut
    return { annual, each, pct: Math.min(100, (annual / BIG_TECH_BAR) * 100) };
  }, [users, price, team]);

  const verdict = each > 250000 ? "That's a very good living. For each of you."
    : each > 90000 ? "That's a living. A real one, without a board."
    : each > 30000 ? "That's a side project that pays for itself, and then some."
    : "That's a hobby. Which is also allowed.";

  return (
    <section id="math" className="section math">
      <div className="wrap">
        <Reveal>
          <p className="mono kicker">The math</p>
        </Reveal>
        <Reveal delay={0.05} className="grid-2" style={{ marginTop: 22, alignItems: "end", marginBottom: 44 }}>
          <h2 className="display h2"><Words text="Structurally invisible." /> <em>Perfectly sized.</em></h2>
          <p className="lede">A billion-user company can't see a ten-thousand-user market. That has nothing to do with the market. Drag the sliders. The numbers are the whole argument.</p>
        </Reveal>

        <Reveal delay={0.1} className="panel">
          <div className="ctrl">
            <label>
              <div className="row"><span className="mono">People who love it</span><span className="val">{users.toLocaleString()}</span></div>
              <input type="range" min={0} max={100} step={1} value={Math.round(Math.log10(users / 1000) * 50)} onChange={(e) => setUsers(Math.round(1000 * Math.pow(10, e.target.value / 50) / 100) * 100)} aria-label="Number of users" />
            </label>
            <label>
              <div className="row"><span className="mono">What they pay, per month</span><span className="val">${price}</span></div>
              <input type="range" min={2} max={40} step={1} value={price} onChange={(e) => setPrice(+e.target.value)} aria-label="Monthly price in dollars" />
            </label>
            <label>
              <div className="row"><span className="mono">Generalists on the team</span><span className="val">{team}</span></div>
              <input type="range" min={1} max={5} step={1} value={team} onChange={(e) => setTeam(+e.target.value)} aria-label="Team size" />
            </label>
            <p className="thin-note">Assumes a 30% store cut and on-device inference, so infrastructure rounds to nothing.</p>
          </div>

          <div className="out">
            <div>
              <div className="mono" style={{ marginBottom: 10 }}>Revenue per year</div>
              <div className="big">{fmt(annual)}</div>
            </div>
            <div>
              <div className="mono" style={{ marginBottom: 10 }}>Per person, after the store's cut</div>
              <div className="big" style={{ color: "var(--seal)" }}>{fmt(Math.max(0, each))}<small>/ yr</small></div>
            </div>
            <div className="cmp">
              <div className="lbl"><span>This studio</span><span>{fmt(annual)}</span></div>
              <div className="bar"><i className="seal" style={{ width: `${Math.max(1.5, pct)}%` }} /></div>
              <div className="lbl"><span>What a big-tech roadmap can see</span><span>$100M+</span></div>
              <div className="bar"><i style={{ width: "100%" }} /></div>
            </div>
            <p className="verdict"><b>{verdict}</b> Google could copy the code by Friday. It can't copy the reason anyone would pay for it.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
