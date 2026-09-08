import { useEffect, useRef, useState } from "react";
import { usePinProgress, subscribeScroll, reducedMotion, isTouch } from "../lib/scroll.js";
import { Words } from "../lib/Reveal.jsx";

/*
  Pinned section, 520svh tall. Scroll progress s ∈ [0,1] drives:
    – the particle field (uProgress 0→2)
    – five text layers that fade in/out around their own centre
  The pointer repels points; a tap or click gathers a small vermilion cluster.
*/
const STEPS = [
  { at: 0.30, n: "01 — The dinosaurs", h: "Big tech needs a billion of you to bother.", p: "A product that only ten thousand people would love is, to a trillion-dollar company, a rounding error. Not a bad idea. Just an unprofitable one, for them." },
  { at: 0.50, n: "02 — The cost floor drops", h: "Two people with AI tools can now build what used to take twenty.", p: "When that happens, the cost of making software falls below the line where venture capital needs to be involved at all. Nobody has to ask permission." },
  { at: 0.70, n: "03 — The mammals", h: "Ten thousand people is a market. And a living.", p: "Aspiring singers. Independent bookstores. Community theatres. Markets that were never too small. They were only too small for them." },
  { at: 0.90, n: "04 — Micro Tech", h: "Three of those constellations are ours.", p: "Studio Ikigai is one engineer, on-device AI, and products that answer to the people using them. Tap anywhere to found one of your own." },
];

export function Thesis() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const stepRefs = useRef([]);
  const progress = usePinProgress(wrapRef);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = reducedMotion();
    const touch = isTouch();
    const count = touch || window.innerWidth < 800 ? 9000 : 20000;
    let field = null, unsub = () => {}, io = null, cancelled = false, onVis = null;

    // let the text paint first; the GPU work can wait a frame
    const boot = setTimeout(() => {
      import("../gl/particles.js").then(({ createParticles }) => {
        if (cancelled) return;
        field = createParticles(canvas, { count });
        if (!field) { setWebgl(false); return; }
        wire();
      }).catch(() => setWebgl(false));
    }, 60);

    const norm = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    const onMove = (e) => { if (!field) return; const [x, y] = norm(e); field.setPointer(x, y, !touch); };
    const onLeave = () => field?.clearPointer();
    const onTap = (e) => {
      if (!field || reduce) return;
      if (e.target.closest("a, button")) return;
      const [x, y] = norm(e); field.tap(x, y);
    };
    const pin = wrapRef.current;
    if (!touch) { window.addEventListener("pointermove", onMove, { passive: true }); document.addEventListener("mouseleave", onLeave); }
    pin.addEventListener("pointerdown", onTap, { passive: true });

    function wire() {
      unsub = subscribeScroll(() => {
        const s = progress.current;
        let p = 0;
        if (s > 0.36) p = Math.min(1, (s - 0.36) / 0.18);
        if (s > 0.56) p = 1 + Math.min(1, (s - 0.56) / 0.22);
        field.setProgress(reduce ? (s < 0.5 ? 0 : 2) : p);
        field.setPulse(s > 0.2 && s < 0.4 ? 1 : 0);
        const hero = heroRef.current;
        if (hero) {
          const o = Math.max(0, 1 - s / 0.14);
          hero.style.opacity = o;
          hero.style.transform = `translateY(${-(1 - o) * 40}px)`;
          hero.style.visibility = o === 0 ? "hidden" : "visible";
        }
        STEPS.forEach((st, i) => {
          const el = stepRefs.current[i];
          if (!el) return;
          const d = Math.abs(s - st.at) / 0.1;
          const o = Math.max(0, 1 - d * d);
          el.style.opacity = o;
          el.style.transform = `translateY(${(s < st.at ? 1 : -1) * (1 - o) * 30}px)`;
          el.style.visibility = o < 0.02 ? "hidden" : "visible";
        });
      });
      let visible = true;
      io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible && !document.hidden ? field.start() : field.stop(); });
      io.observe(pin);
      onVis = () => (document.hidden || !visible ? field.stop() : field.start());
      document.addEventListener("visibilitychange", onVis);
    }

    return () => {
      cancelled = true; clearTimeout(boot); unsub(); io?.disconnect();
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove); document.removeEventListener("mouseleave", onLeave);
      pin.removeEventListener("pointerdown", onTap);
      field?.dispose();
    };
  }, [progress]);

  return (
    <section id="thesis" className="thesis" ref={wrapRef} aria-label="The Micro Tech thesis">
      <div className="pin">
        {webgl ? <canvas ref={canvasRef} aria-hidden="true" /> : (
          <div className="fallback" aria-hidden="true">
            <svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="150" fill="#1A1714" opacity="0.9" /></svg>
          </div>
        )}
        <div className="vignette" aria-hidden="true" />

        <div className="layer hero" ref={heroRef}>
          <div className="hero-top">
            <p className="mono kicker" style={{ marginTop: 4 }}>An independent software studio</p>
            <p className="mono small" style={{ textAlign: "right" }}>San Diego · Est. 2025<br />One engineer</p>
          </div>
          <div className="hero-bottom">
            <h1 className="display h1 hero-title">
              <Words text="The market was never" mount delay={0.9} />{" "}
              <em><Words text="too small." mount delay={1.15} /></em>
            </h1>
            <div className="stack" style={{ "--gap": "22px" }}>
              <p className="lede">It was too small for <em className="serif-it">them</em>. Studio Ikigai builds on-device software for the ten thousand people big tech can't afford to care about. Scroll to break the model.</p>
              <div className="hero-meta">
                <span><b>Antiviral</b> feed</span>
                <span><b>Inner Voice</b> voice</span>
                <span><b>Sing!</b> song</span>
              </div>
              <div className="scroll-cue"><i /> Scroll</div>
            </div>
          </div>
        </div>

        {STEPS.map((st, i) => (
          <div className="step" key={st.n} ref={(el) => (stepRefs.current[i] = el)} aria-hidden="true">
            <div className="n">{st.n}</div>
            <h2>{st.h}</h2>
            <p>{st.p}</p>
          </div>
        ))}
      </div>
      <div className="sr-only">
        {STEPS.map((st) => <p key={st.n}>{st.n}. {st.h} {st.p}</p>)}
      </div>
    </section>
  );
}
