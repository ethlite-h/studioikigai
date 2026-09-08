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
  // voice-print halo drawn around the photograph
  useCanvasLoop(canvas, (ctx, w, h, t) => {
    drawVoicePrint(ctx, w, h, t * 0.6, { paper: "rgba(0,0,0,0)", ink: "#F3EFE6", accent: "#E8A48F", rings: 6, scale: 1.28 });
  }, inView);
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
        <div className="grid-2" style={{ marginTop: 32, alignItems: "start" }}>
          <Reveal className="stack" style={{ "--gap": "24px" }}>
            <h2 id="builder-h" className="display h2"><Words text="Engineers like me never got to decide" /> <em>what to build.</em></h2>
            <p className="lede">Helen Ma spent seventeen years at Apple. She was on the original iPhone and iPad engineering teams, built a demo for a Steve Jobs keynote, reviewed the early iOS SDK's APIs, owned visual effects and materials for visionOS through five unannounced years, and built and led the team that shipped Journal for iOS 17.</p>
            <p className="body">In between, she was CTO of the studio behind Band of the Day, App Store App of the Year 2011, and architected the 1.0 of Smule's Sing! Karaoke, which millions still sing on.</p>
            <p className="body">Eleven zero-to-one launches. Two patents. One conviction: AI should amplify human judgment and creativity, not replace it. In April 2025 she founded Studio Ikigai in San Diego to prove it, one app at a time. The roadmap, for once, is hers.</p>
            <blockquote>“The moat isn't the code. Google could copy it by Friday. It's <em>taste, community, and being close enough to the problem to know what matters.</em>”</blockquote>
            <p className="body">The first song ever shipped through Sing! is called <span className="serif-it" style={{ color: "var(--paper)" }}>She Rises!</span> It was written for her eight-year-old daughter, who had no formal training, no label, and no reason to wait for either.</p>
            <div className="btn-row" style={{ alignItems: "center", gap: 24 }}>
              <span className="sig">Helen</span>
              <a className="btn" href="mailto:info@studioikigai.ai"><span>Write to her</span><span className="arr">→</span></a>
              <a className="btn ghost" href="https://linkedin.com/in/ethlite" target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><span className="arr">↗</span></a>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="portrait-wrap">
            <figure>
              <div className="portrait">
                <canvas ref={canvas} className="halo" aria-hidden="true" />
                <picture>
                  <source srcSet="/media/helen.webp" type="image/webp" />
                  <img src="/media/helen.jpg" alt="Helen Ma, founder of Studio Ikigai" width="880" height="880" loading="lazy" decoding="async" />
                </picture>
              </div>
              <figcaption className="cap">Helen Ma · founder, engineer, and the voice on the demo track</figcaption>
            </figure>
            <dl className="facts">
              <div><dt>Years on the Apple platform</dt><dd>25</dd></div>
              <div><dt>Zero-to-one launches</dt><dd>11</dd></div>
              <div><dt>Patents</dt><dd>2</dd></div>
              <div><dt>Investors</dt><dd>0</dd></div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
