import { useEffect, useRef } from "react";
import { Reveal, Words } from "../lib/Reveal.jsx";
import { useCanvasLoop } from "./Phone.jsx";
import { drawVoicePrint } from "../phones/VoicePrintPhone.jsx";
import { useInView } from "../lib/scroll.js";

export function Founder() {
  const ref = useRef(null);
  const canvas = useRef(null);
  const vid = useRef(null);
  const inView = useInView(ref, "100px");
  useCanvasLoop(canvas, (ctx, w, h, t) => drawVoicePrint(ctx, w, h, t * 0.6, { paper: "#1A1714", ink: "#F3EFE6", accent: "#E8A48F", rings: 7, scale: 0.92 }), inView);
  useEffect(() => { const v = vid.current; if (!v) return; inView ? v.play?.().catch(() => {}) : v.pause?.(); }, [inView]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let obs;
    const make = () => {
      obs?.disconnect();
      obs = new IntersectionObserver(([e]) => document.querySelector(".nav")?.classList.toggle("dark", e.isIntersecting), { rootMargin: `0px 0px -${Math.max(0, window.innerHeight - 40)}px 0px` });
      obs.observe(el);
    };
    make();
    window.addEventListener("resize", make);
    return () => { obs?.disconnect(); window.removeEventListener("resize", make); document.querySelector(".nav")?.classList.remove("dark"); };
  }, []);

  return (
    <section id="builder" className="section founder lower" ref={ref} aria-labelledby="builder-h">
      <video ref={vid} className="bg" muted loop playsInline preload="none" aria-hidden="true">
        <source src="/media/waveform.mp4" type="video/mp4" />
      </video>
      <div className="wrap" style={{ position: "relative" }}>
        <Reveal><p className="mono kicker">The builder</p></Reveal>
        <div className="grid-2" style={{ marginTop: 32 }}>
          <Reveal className="stack" style={{ "--gap": "26px" }}>
            <h2 id="builder-h" className="display h2"><Words text="Engineers like me never got to decide" /> <em>what to build.</em></h2>
            <p className="lede">Helen Ma spent her career inside big tech, where the roadmap arrives from somewhere above you and the only question left is how fast. Kinda like LLMs, come to think of it.</p>
            <p className="body">Studio Ikigai is what happens when one of those engineers finally does get to decide. Not to compete with the companies she left, but to build in the spaces they can't profitably see: a few thousand aspiring singers, a family that wants a feed it can trust, a kid who wants to hear her own song.</p>
            <blockquote>“The moat isn't the code. Google could copy it by Friday. It's <em>taste, community, and being close enough to the problem to know what matters.</em>”</blockquote>
            <p className="body">The first song ever shipped through Sing! is called <span className="serif-it" style={{ color: "var(--paper)" }}>She Rises!</span> It was written for her eight-year-old daughter, who had no formal training, no label, and no reason to wait for either.</p>
            <div className="btn-row" style={{ alignItems: "center", gap: 24 }}>
              <span className="sig">Helen</span>
              <a className="btn" href="mailto:info@studioikigai.ai"><span>Write to her</span><span className="arr">→</span></a>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <figure>
              <div className="portrait"><canvas ref={canvas} /></div>
              <figcaption className="cap">Not a photo. A voice print.</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
