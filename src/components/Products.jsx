import { useEffect, useRef, useState } from "react";
import { Reveal, Words } from "../lib/Reveal.jsx";
import { AntiviralPhone } from "../phones/AntiviralPhone.jsx";
import { VoicePrintPhone } from "../phones/VoicePrintPhone.jsx";
import { SingPhone } from "../phones/SingPhone.jsx";
import { useInView } from "../lib/scroll.js";

const PRODUCTS = [
  {
    id: "antiviral", n: "01", name: "Antiviral", badge: "Free · iOS", acc: "var(--moss)",
    title: "A feed that answers to you.",
    lede: "Antiviral builds your feed from your own subscriptions, on your own phone, and lets you talk to it. Say what you want more of. Say what you're done with. It listens, and it shows you exactly what it thinks you like, so you can correct it.",
    feats: ["Conversational control: \"less politics, more woodworking\"", "The topic model is visible, editable, deletable. It's yours.", "On-device AI. No account, no server, no one watching.", "Family edition with a parents' dashboard"],
    cta: ["getantiviral.app", "https://getantiviral.app"],
    Phone: AntiviralPhone,
  },
  {
    id: "innervoice", n: "02", name: "Inner Voice", badge: "Beta · iOS", acc: "var(--clay)",
    title: "Hear yourself clearly.",
    lede: "A vocal wellness app that turns a recording of your voice into a Visual Voice Print and gives you feedback on expression, not performance. Not how well you sang. How much of you was in it.",
    feats: ["Recordings become Voice Prints you can watch change over weeks", "The Voice Expression Index rewards authenticity over technique", "Everything is analysed on the phone. Your voice never leaves it.", "Companion apps for singing and making music"],
    cta: ["findyourinnervoice.app", "https://findyourinnervoice.app"],
    Phone: VoicePrintPhone,
    video: true,
  },
  {
    id: "sing", n: "03", name: "Inner Voice Sing!", badge: "The case study", acc: "var(--indigo)",
    title: "Your song. Your lyrics. Your voice.",
    lede: "Describe a song. Sing! generates the instrumental, transposes it into your range, and scores your pitch, timing and diction as you sing, all on the phone, with no API calls. The only thing the AI made is the backing track.",
    feats: ["Started as a port of open-source UltraStar. Nothing of it remains.", "On-device ML scores pitch, rhythm and enunciation live", "Custom song format keeps lyrics, phrasing and BPM-driven visuals", "The first song shipped was written for an eight-year-old"],
    cta: ["Read how it was built", "#builder"],
    Phone: SingPhone,
  },
];

function Product({ p, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, "200px");
  const vidRef = useRef(null);
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    if (inView) v.play?.().catch(() => {}); else v.pause?.();
  }, [inView]);

  return (
    <article id={p.id} className="product" style={{ "--acc": p.acc }} ref={ref}>
      <div className="num" aria-hidden="true">{p.n}</div>
      <div className={`wrap grid-2 ${i % 2 ? "flip" : ""}`}>
        <Reveal className="copy">
          <div className="name"><span>{p.name}</span><span className="badge">{p.badge}</span></div>
          <h3 className="display h3"><Words text={p.title} /></h3>
          <p className="body">{p.lede}</p>
          <ul className="feat">{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
          <div className="btn-row">
            <a className="btn" href={p.cta[1]} target={p.cta[1].startsWith("http") ? "_blank" : undefined} rel={p.cta[1].startsWith("http") ? "noopener noreferrer" : undefined}>
              <span>{p.cta[0]}</span><span className="arr">→</span>
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="stage">
          {p.video && (
            <video ref={vidRef} muted loop playsInline preload="metadata" poster="/media/voiceprint.jpg" aria-hidden="true">
              <source src="/media/voiceprint.mp4" type="video/mp4" />
            </video>
          )}
          <p.Phone />
        </Reveal>
      </div>
    </article>
  );
}

export function Products() {
  return (
    <section id="products" className="lower" aria-labelledby="products-h">
      <div className="wrap section tight" style={{ paddingBottom: 0 }}>
        <Reveal><p className="mono kicker">Three products</p></Reveal>
        <Reveal delay={0.05} className="grid-2" style={{ marginTop: 22, alignItems: "end" }}>
          <h2 id="products-h" className="display h2"><Words text="Built for the ten thousand," /> <em>not the billion.</em></h2>
          <p className="lede">Each one runs its intelligence on your phone, shows you its model of you, and lets you change it. None of them have a server to breach, because none of them have a server.</p>
        </Reveal>
      </div>
      {PRODUCTS.map((p, i) => <Product p={p} i={i} key={p.id} />)}
    </section>
  );
}
