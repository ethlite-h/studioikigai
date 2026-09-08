import { useEffect, useRef } from "react";
import { Reveal, Words } from "../lib/Reveal.jsx";
import { AntiviralPhone } from "../phones/AntiviralPhone.jsx";
import { VoicePrintPhone } from "../phones/VoicePrintPhone.jsx";
import { SingPhone } from "../phones/SingPhone.jsx";
import { Listen } from "./Listen.jsx";
import { useInView } from "../lib/scroll.js";

const PRODUCTS = [
  {
    id: "antiviral", n: "01", name: "Antiviral", badge: "TestFlight · iOS & macOS", acc: "var(--moss)",
    title: "A feed that answers to you.",
    lede: "Antiviral builds your feed from your own subscriptions, on your own device, and lets you talk to it. Say what you want more of. Say what you're done with. It listens, shows you exactly what it thinks you like, and lets you correct it.",
    feats: ["Conversational control: \"less politics, more woodworking\"", "Apple Foundation Models run the conversation on-device; nothing you say leaves the phone", "Picks Mode: a turn-based feed that ends, instead of an infinite scroll", "The topic model is visible, editable and deletable. It's yours."],
    cta: ["getantiviral.app", "https://getantiviral.app"],
    store: "Coming to the App Store. In TestFlight now.",
    Phone: AntiviralPhone,
  },
  {
    id: "innervoice", n: "02", name: "Inner Voice", badge: "TestFlight · iOS", acc: "var(--clay)",
    title: "Hear yourself clearly.",
    lede: "A vocal wellness app that turns a recording of your voice into a Visual Voice Print and gives you feedback the way a vocal coach would, not just a pitch meter. Not how well you sang. How much of you was in it.",
    feats: ["Three open-source models on-device via Core ML: CREPE for pitch, HuBERT for the voice itself, Whisper for the words", "Multi-dimensional assessment: expression and authenticity, not only accuracy", "Your voice is analysed on the phone. It never leaves it.", "Voice Prints you can watch change over weeks"],
    cta: ["findyourinnervoice.app", "https://findyourinnervoice.app"],
    store: "Coming to the App Store. In TestFlight now.",
    Phone: VoicePrintPhone,
    video: true,
  },
  {
    id: "sing", n: "03", name: "Inner Voice Sing!", badge: "The case study", acc: "var(--indigo)",
    title: "Your song. Your lyrics. Your voice.",
    lede: "Describe a song. Sing! has an AI provider write the instrumental, transposes it into your range, and scores your pitch, timing and diction live as you sing, with every scoring model running on the phone. Press play: the mockup follows the real take of She Rises!, word by word, from the studio's own timing data.",
    feats: ["Started as a port of open-source UltraStar. Nothing of it remains.", "Scoring is on-device: CREPE, HuBERT and Whisper through Core ML, no round trip to a server", "Instrumentals from swappable providers (ElevenLabs, Suno), never your voice", "The first song shipped was written for an eight-year-old"],
    cta: ["Read how it was built", "#theseus"],
    Phone: SingPhone,
    listen: true,
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
      <div className="num" data-n={p.n} aria-hidden="true" />
      <div className={`wrap grid-2 ${i % 2 ? "flip" : ""}`}>
        <Reveal className="copy">
          <div className="name"><span>{p.name}</span><span className="badge">{p.badge}</span></div>
          <h3 className="display h3"><Words text={p.title} /></h3>
          <p className="body">{p.lede}</p>
          <ul className="feat">{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
          <div className="btn-row" style={{ alignItems: "center" }}>
            <a className="btn" href={p.cta[1]} target={p.cta[1].startsWith("http") ? "_blank" : undefined} rel={p.cta[1].startsWith("http") ? "noopener noreferrer" : undefined}>
              <span>{p.cta[0]}</span><span className="arr">→</span>
            </a>
            {p.listen && <Listen />}
          </div>
          {p.store && <p className="thin-note">{p.store}</p>}
        </Reveal>
        <Reveal delay={0.1} className="stage">
          {p.video && (
            <video ref={vidRef} muted loop playsInline preload="metadata" poster="/media/voiceprint.jpg" aria-hidden="true">
              <source src="/media/voiceprint.mp4" type="video/mp4" />
            </video>
          )}
          <p.Phone />
          <p className="thin-note stage-cap">{p.listen ? "Interactive mockup · real timing, sample scores" : "Interactive mockup · sample data"}</p>
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
          <p className="lede">Each one runs its intelligence on your device, shows you its model of you, and lets you change it. Your data isn't the product, because there's nobody to sell it to.</p>
        </Reveal>
      </div>
      {PRODUCTS.map((p, i) => <Product p={p} i={i} key={p.id} />)}
    </section>
  );
}
