import { useRef } from "react";
import { Phone, useCanvasLoop } from "../components/Phone.jsx";
import { useInView } from "../lib/scroll.js";

/* Karaoke piano-roll: target notes scroll left, the singer's pitch trace follows, slightly human. */
const NOTES = [[0, 1, 2], [1, 1, 4], [2, 1, 6], [3, 2, 8], [5, 0.5, 7], [5.5, 0.5, 5], [6, 1, 4], [7, 1, 2], [8, 1, 3], [9, 1, 4], [10, 1, 5], [11, 2, 8], [13, 1, 9], [14, 1, 8], [15, 1, 4], [16, 1, 5], [17, 1, 7], [18, 2, 9]];
const LOOP = 20; // beats, four per lyric line
const BPS = 1.6;
// Chorus of "She Rises!" (the founder's song)
const LINES = ["She lives on!", "In me.", "In the parts of me I forgot,", "tried to erase,", "before finally setting free."];

function drawRoll(ctx, w, h, t) {
  const beat = (t * BPS) % LOOP;
  ctx.clearRect(0, 0, w, h);
  const pxPerBeat = w / 6.5, head = w * 0.32, lanes = 10, laneH = h / lanes;
  // staff lines
  ctx.strokeStyle = "rgba(26,23,20,0.08)"; ctx.lineWidth = 1;
  for (let i = 1; i < lanes; i++) { ctx.beginPath(); ctx.moveTo(0, i * laneH); ctx.lineTo(w, i * laneH); ctx.stroke(); }
  // target notes (two loops so wraparound looks continuous)
  for (const pass of [0, LOOP]) {
    for (const [b, len, lane] of NOTES) {
      const x = head + (b + pass - beat) * pxPerBeat;
      const y = h - (lane + 0.5) * laneH;
      if (x + len * pxPerBeat < -10 || x > w + 10) continue;
      const past = x + len * pxPerBeat < head, live = x <= head && x + len * pxPerBeat >= head;
      ctx.fillStyle = live ? "#2F3F6B" : past ? "rgba(47,63,107,0.35)" : "rgba(26,23,20,0.18)";
      const r = 4;
      ctx.beginPath(); ctx.roundRect(x, y - 5, len * pxPerBeat - 4, 10, r); ctx.fill();
    }
  }
  // sung pitch trace: follows the target with a human wobble, only for the past
  ctx.beginPath();
  ctx.strokeStyle = "#C8371C"; ctx.lineWidth = 2; ctx.lineJoin = "round";
  let last = null;
  for (let px = 0; px <= head; px += 2) {
    const b = beat - (head - px) / pxPerBeat;
    if (b < 0) continue;
    const n = NOTES.find(([nb, len]) => b >= nb + 0.04 && b < nb + len - 0.03);
    if (!n) { last = null; continue; }
    const wob = Math.sin(b * 11 + t) * 1.4 + Math.sin(b * 5.3) * 1.2 + (b - n[0] < 0.15 ? (0.15 - (b - n[0])) * 14 : 0);
    const y = h - (n[2] + 0.5) * laneH + wob;
    n === last ? ctx.lineTo(px, y) : ctx.moveTo(px, y);
    last = n;
  }
  ctx.stroke();
  // playhead
  ctx.strokeStyle = "rgba(26,23,20,0.5)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(head, 0); ctx.lineTo(head, h); ctx.stroke(); ctx.setLineDash([]);
  return beat;
}

export function SingPhone() {
  const ref = useRef(null);
  const canvas = useRef(null);
  const lyricRef = useRef(null);
  const inView = useInView(ref, "80px");
  useCanvasLoop(canvas, (ctx, w, h, t) => {
    const beat = drawRoll(ctx, w, h, t);
    const line = Math.floor(beat / 4);
    const el = lyricRef.current;
    if (el && el.dataset.line !== String(line)) {
      el.dataset.line = line;
      el.querySelectorAll("p").forEach((p, i) => { p.style.opacity = i === line ? 1 : 0.28; p.style.color = i === line ? "var(--indigo)" : "var(--ink-2)"; });
    }
  }, inView);

  return (
    <div ref={ref}>
      <Phone>
        <div className="app">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="title">She Rises!</div>
              <div className="sub" style={{ marginTop: 6 }}>Your lyrics · your voice · AI instrumental</div>
            </div>
          </div>
          <div ref={lyricRef} style={{ display: "grid", gap: 2, fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.3, fontVariationSettings: '"opsz" 24, "SOFT" 40', minHeight: 100 }}>
            {LINES.map((l) => <p key={l} style={{ transition: "opacity 0.4s, color 0.4s", opacity: 0.28 }}>{l}</p>)}
          </div>
          <div style={{ flex: 1, position: "relative", background: "#fff", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
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
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--seal)", boxShadow: "0 0 0 3px rgba(200,55,28,0.2)" }} /> Scored on device · no upload
          </div>
        </div>
      </Phone>
    </div>
  );
}
