import { useEffect, useRef } from "react";
import { isTouch } from "../lib/scroll.js";

/* Device frame. Tilts toward the pointer on desktop; sits still on touch. */
export function Phone({ children, tilt = true, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !tilt || isTouch()) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${x * 14}deg`);
      el.style.setProperty("--rx", `${-y * 10}deg`);
    };
    const onLeave = () => { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); };
    const parent = el.parentElement;
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => { parent.removeEventListener("pointermove", onMove); parent.removeEventListener("pointerleave", onLeave); };
  }, [tilt]);
  return (
    <div className={`phone ${className}`} ref={ref} aria-hidden="true">
      <div className="screen">
        <div className="island" />
        <div className="status"><span>9:41</span><span>●●●</span></div>
        {children}
      </div>
    </div>
  );
}

/* Sizes a canvas to its box at device pixel ratio and runs draw(ctx, w, h, t) while `active`. */
export function useCanvasLoop(ref, draw, active, deps = []) {
  useEffect(() => {
    const c = ref.current;
    if (!c || !active) return;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf, w = 0, h = 0;
    const start = performance.now();
    const fit = () => {
      const bw = c.clientWidth, bh = c.clientHeight;
      if (bw !== w || bh !== h) { w = bw; h = bh; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    };
    const loop = (now) => { raf = requestAnimationFrame(loop); fit(); draw(ctx, w, h, (now - start) / 1000); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, active, ...deps]);
}
