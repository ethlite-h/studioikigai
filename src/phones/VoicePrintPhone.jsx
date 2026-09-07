import { useRef } from "react";
import { Phone, useCanvasLoop } from "../components/Phone.jsx";
import { useInView } from "../lib/scroll.js";

/* Draws a "Visual Voice Print": a radial figure whose lobes are the harmonics of a voice. */
export function drawVoicePrint(ctx, w, h, t, { ink = "#1A1714", accent = "#B7572E", paper = "#F3EFE6", scale = 1, rings = 5 } = {}) {
  ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36 * scale;
  const N = 220;
  for (let k = rings; k >= 1; k--) {
    const rr = R * (0.35 + 0.65 * (k / rings));
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const wob =
        Math.sin(a * 3 + t * 0.9 + k) * 0.11 +
        Math.sin(a * 5 - t * 0.7 + k * 1.7) * 0.07 +
        Math.sin(a * 8 + t * 1.3) * 0.035 +
        Math.sin(a * 13 - t * 0.5 + k) * 0.02;
      const r = rr * (1 + wob * (0.5 + k / rings));
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    const isAccent = k === Math.ceil(rings / 2);
    ctx.strokeStyle = isAccent ? accent : ink;
    ctx.globalAlpha = isAccent ? 0.9 : 0.16 + 0.55 * (1 - k / rings);
    ctx.lineWidth = isAccent ? 1.6 : 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // pulse dot
  ctx.beginPath(); ctx.arc(cx, cy, 3 + Math.sin(t * 3) * 1, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
}

const METRICS = [["Warmth", 0.78], ["Steadiness", 0.64], ["Openness", 0.86]];

export function VoicePrintPhone() {
  const ref = useRef(null);
  const canvas = useRef(null);
  const inView = useInView(ref, "80px");
  useCanvasLoop(canvas, (ctx, w, h, t) => drawVoicePrint(ctx, w, h, t, { scale: 1.05 }), inView);

  return (
    <div ref={ref}>
      <Phone>
        <div className="app">
          <div>
            <div className="title">Inner Voice</div>
            <div className="sub" style={{ marginTop: 6 }}>Voice print · take 3 · 0:12</div>
          </div>
          <div style={{ flex: 1, position: "relative", margin: "0 -6px" }}>
            <canvas ref={canvas} style={{ position: "absolute", inset: 0 }} />
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="sub">Voice Expression Index</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1, color: "var(--clay)" }}>74</span>
            </div>
            {METRICS.map(([n, v]) => (
              <div key={n} style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10.5, color: "var(--ink-2)" }}>{n}</span>
                <span style={{ height: 3, background: "var(--paper-3)", borderRadius: 3, position: "relative" }}>
                  <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: inView ? `${v * 100}%` : 0, background: "var(--clay)", borderRadius: 3, transition: "width 1.4s var(--ease) 0.3s" }} />
                </span>
              </div>
            ))}
            <div className="sub" style={{ color: "var(--clay)" }}>Authentic, not polished. Keep this take.</div>
          </div>
        </div>
      </Phone>
    </div>
  );
}
