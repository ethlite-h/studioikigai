import { useEffect, useRef, useState } from "react";
import { Phone } from "../components/Phone.jsx";
import { useInView } from "../lib/scroll.js";

/* A feed you can talk to. The script: type a request → topics change → feed re-sorts. */
const TOPICS = ["Woodworking", "Jazz piano", "Trail running", "News", "Politics", "Celebrity"];
const FEED = [
  { t: "Hand-cut dovetails, no jig", s: "YouTube · 14 min", tag: "Woodworking", c: ["#B7A27A", "#6E5A3A"] },
  { t: "Election night, live", s: "News · 2h ago", tag: "News", c: ["#9A9A9A", "#3A3A3A"] },
  { t: "Voicing a II–V–I like Bill Evans", s: "Podcast · 41 min", tag: "Jazz piano", c: ["#2F3F6B", "#7E8CB8"] },
  { t: "Who wore what at the gala", s: "Blog · 1h ago", tag: "Celebrity", c: ["#D8B4C6", "#8C5A76"] },
  { t: "Finishing oak with pure tung oil", s: "Blog · 6 min read", tag: "Woodworking", c: ["#C9A66B", "#7A5A2E"] },
  { t: "Zone 2 for people who hate zone 2", s: "Podcast · 28 min", tag: "Trail running", c: ["#4F6B4A", "#9DBB8E"] },
];
const ASK = "less politics, more woodworking";

export function AntiviralPhone() {
  const ref = useRef(null);
  const inView = useInView(ref, "80px");
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState(0); // 0 idle, 1 typing, 2 applied

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    const timers = [];
    const run = () => {
      if (!alive) return;
      setPhase(1); setTyped("");
      ASK.split("").forEach((_, i) => timers.push(setTimeout(() => alive && setTyped(ASK.slice(0, i + 1)), 500 + i * 45)));
      timers.push(setTimeout(() => alive && setPhase(2), 500 + ASK.length * 45 + 600));
      timers.push(setTimeout(() => { if (alive) { setPhase(0); setTyped(""); } }, 7200));
      timers.push(setTimeout(run, 8400));
    };
    timers.push(setTimeout(run, 400));
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [inView]);

  const applied = phase === 2;
  const on = (t) => applied ? t === "Woodworking" : ["Woodworking", "Jazz piano", "Trail running", "News"].includes(t);
  const off = (t) => applied ? ["Politics", "Celebrity", "News"].includes(t) : ["Politics", "Celebrity"].includes(t);
  const order = applied ? [...FEED].sort((a, b) => (b.tag === "Woodworking") - (a.tag === "Woodworking")) : FEED;

  return (
    <div ref={ref}>
      <Phone>
        <div className="app av">
          <div>
            <div className="title">Antiviral</div>
            <div className="sub" style={{ marginTop: 6 }}>Your subscriptions · nothing else</div>
          </div>
          <div className="chips">
            {TOPICS.map((t) => <span key={t} className={`chip ${on(t) ? "on" : ""} ${off(t) ? "off" : ""}`}>{t}</span>)}
          </div>
          <div className="feed">
            {order.slice(0, 4).map((f) => (
              <div key={f.t} className={`card ${applied && (f.tag === "News" || f.tag === "Celebrity") ? "gone" : ""}`} style={{ "--c1": f.c[0], "--c2": f.c[1] }}>
                <div className="th" />
                <div><b>{f.t}</b><small>{f.s}</small></div>
              </div>
            ))}
          </div>
          <div className="ondev">On-device · nothing leaves the phone</div>
          <div className="ask">
            <span style={{ color: typed ? "var(--ink)" : "var(--ink-3)" }}>{typed || (phase === 2 ? "Done. Feed updated." : "Talk to your feed…")}</span>
            {phase === 1 && <span className="cur" />}
            <span className="mic" />
          </div>
        </div>
      </Phone>
    </div>
  );
}
