import { useState } from "react";
import { Reveal } from "../lib/Reveal.jsx";

/* Hands the address to Substack's own subscribe page. No backend, no list of ours. */
export function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <Reveal delay={0.15} className="news">
      <div className="stack" style={{ "--gap": "10px" }}>
        <p className="mono kicker">Immortal Pyramids</p>
        <h3 className="h4">Get the next essay.</h3>
        <p className="body" style={{ fontSize: 15.5 }}>Helen's newsletter and podcast on AI, tech culture and power, and the occasional dispatch from the studio. Hosted on Substack. We never see your address.</p>
      </div>
      <form className="news-form" action="https://ethlite.substack.com/subscribe" method="get" target="_blank" rel="noopener">
        <label className="sr-only" htmlFor="news-email">Email address</label>
        <input id="news-email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="btn seal"><span>Subscribe</span><span className="arr">↗</span></button>
      </form>
    </Reveal>
  );
}
