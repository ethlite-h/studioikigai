import { useEffect, useRef, useState } from "react";
import { Phone, useCanvasLoop } from "../components/Phone.jsx";
import { useInView } from "../lib/scroll.js";
import { player } from "../lib/player.js";

/*
  Karaoke view driven by the real timeline of "She Rises!" (phrase, word and
  target-note timing exported from the studio's BrightStar bundle).
  Playing: follows the shared audio. Idle: silently loops the first chorus.
*/
const { phrases } = player.song;
const WORDS = phrases.flatMap((p, pi) => p.w.map((w) => ({ ...w, pi })));
const IDLE_FROM = 24.0, IDLE_TO = 37.6;
const NOTE_LO = 60, NOTE_HI = 94, LANES = 10;
const laneOf = (n) => Math.max(0, Math.min(LANES - 1, Math.round(((n - NOTE_LO) / (NOTE_HI - NOTE_LO)) * (LANES - 1))));

function drawRoll(ctx, w, h, t, sing) {
  ctx.clearRect(0, 0, w, h);
  const pxPerSec = w / 4.2, head = w * 0.32, laneH = h / LANES;
  ctx.strokeStyle = "rgba(26,23,20,0.08)"; ctx.lineWidth = 1;
  for (let i = 1; i < LANES; i++) { ctx.beginPath(); ctx.moveTo(0, i * laneH); ctx.lineTo(w, i * laneH); ctx.stroke(); }
  for (const wd of WORDS) {
    const x = head + (wd.s - t) * pxPerSec, len = Math.min(3.5, wd.e - wd.s) * pxPerSec;
    if (x + len < -10 || x > w + 10) continue;
    const y = h - (laneOf(wd.n) + 0.5) * laneH;
    const past = x + len < head, live = x <= head && x + len >= head;
    ctx.fillStyle = live ? "#2F3F6B" : past ? "rgba(47,63,107,0.35)" : "rgba(26,23,20,0.18)";
    ctx.beginPath(); ctx.roundRect(x, y - 5, Math.max(6, len - 3), 10, 4); ctx.fill();
  }
  // the sung line: follows the targets with a human wobble, only for what's been sung
  ctx.beginPath(); ctx.strokeStyle = "#C8371C"; ctx.lineWidth = 2; ctx.lineJoin = "round";
  let last = null;
  for (let px = 0; px <= head; px += 2) {
    const tt = t - (head - px) / pxPerSec;
    const wd = WORDS.find((x) => tt >= x.s + 0.03 && tt < Math.min(x.e, x.s + 3.5) - 0.02);
    if (!wd) { last = null; continue; }
    const wob = Math.sin(tt * 11) * 1.4 + Math.sin(tt * 5.3) * 1.2 + (tt - wd.s < 0.15 ? (0.15 - (tt - wd.s)) * 14 : 0);
    const y = h - (laneOf(wd.n) + 0.5) * laneH + wob * (sing ? 1 : 0.6);
    wd === last ? ctx.lineTo(px, y) : ctx.moveTo(px, y);
    last = wd;
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(26,23,20,0.5)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(head, 0); ctx.lineTo(head, h); ctx.stroke(); ctx.setLineDash([]);
}

export function SingPhone() {
  const ref = useRef(null);
  const canvas = useRef(null);
  const listRef = useRef(null);
  const inView = useInView(ref, "80px");
  const [live, setLive] = useState(false);
  const idleT0 = useRef(performance.now());
  useEffect(() => player.subscribe((s) => setLive(s.state === "playing" || s.state === "paused")), []);

  useCanvasLoop(canvas, (ctx, w, h) => {
    let t;
    if (live) t = player.now();
    else t = IDLE_FROM + (((performance.now() - idleT0.current) / 1000) % (IDLE_TO - IDLE_FROM));
    drawRoll(ctx, w, h, t, live);
    // lyrics: active phrase centred, words fill as they're sung
    const list = listRef.current;
    if (!list) return;
    let ai = phrases.findIndex((p) => t < p.e);
    if (ai < 0) ai = phrases.length - 1;
    if (t < phrases[ai].s - 1.2 && ai > 0) ai = ai - 1; // hold the previous line through short gaps
    if (list.dataset.ai !== String(ai)) {
      list.dataset.ai = ai;
      const rows = list.children;
      for (let i = 0; i < rows.length; i++) rows[i].className = i === ai ? "ly on" : i < ai ? "ly past" : "ly";
      const row = rows[ai];
      list.style.transform = `translateY(${-(row.offsetTop - 34)}px)`;
    }
    const row = list.children[ai];
    if (row) for (const sp of row.querySelectorAll("span[data-s]")) {
      const done = t >= +sp.dataset.s;
      if (sp.classList.contains("sung") !== done) sp.classList.toggle("sung", done);
    }
  }, inView, [live]);

  return (
    <div ref={ref}>
      <Phone>
        <div className="app sing">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="title">She Rises!</div>
              <div className="sub" style={{ marginTop: 6 }}>{live ? "Following her take · live" : "Your lyrics · your voice · AI instrumental"}</div>
            </div>
          </div>
          <div className="lyrics" aria-hidden="true">
            <div className="ly-list" ref={listRef}>
              {phrases.map((p, i) => (
                <div className="ly" key={i}>
                  {(i === 0 || phrases[i - 1].sec !== p.sec) && <span className="ly-sec">{p.sec}</span>}
                  {p.w.map((w, j) => <span key={j} data-s={w.s}>{w.t}{j < p.w.length - 1 ? " " : ""}</span>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", background: "#fff", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", minHeight: 120 }}>
            <canvas ref={canvas} style={{ position: "absolute", inset: 0 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {[["Pitch", 92], ["Timing", 88], ["Diction", 95]].map(([n, v]) => (
              <div key={n} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 8px 6px", display: "grid", gap: 2 }}>
                <span className="sub" style={{ fontSize: 8 }}>{n}</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1, color: "var(--indigo)" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="sub" style={{ color: "var(--indigo)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--seal)", boxShadow: "0 0 0 3px rgba(200,55,28,0.2)" }} /> {live ? "Timed from her lead vocal" : "Scored on device · no upload"}
          </div>
        </div>
      </Phone>
    </div>
  );
}
