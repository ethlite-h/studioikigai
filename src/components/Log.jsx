import { Reveal, Words } from "../lib/Reveal.jsx";

/* Studio log. Newest first. Add an entry per shipped thing; keep it true. */
const ENTRIES = [
  { d: "2026-09-07", t: "studioikigai.ai rebuilt around the Micro Tech thesis", p: "One engineer, one week, no agency. Scroll-driven particle field, on-device product mockups, and a real voice print of She Rises! as the texture." },
  { d: "2026-04-16", t: "Essay: Software Engineering's Podcast Moment", p: "The thesis behind the studio, published on Substack: AI is to software what podcasting was to broadcast.", href: "https://ethlite.substack.com/p/software-engineerings-podcast-moment" },
  { d: "2025", t: "Antiviral and Inner Voice enter TestFlight", p: "On-device conversational curation on iOS and macOS; on-device vocal assessment with CREPE, HuBERT and Whisper via Core ML." },
  { d: "2025-04", t: "Studio Ikigai founded in San Diego", p: "After seventeen years at Apple and a string of startups, one engineer finally gets to decide what to build." },
];

const fmt = (d) => {
  const [y, m, day] = d.split("-");
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return day ? `${day.replace(/^0/, "")} ${M[+m - 1]} ${y}` : m ? `${M[+m - 1]} ${y}` : y;
};

export function Log() {
  return (
    <section id="log" className="section tight lower" aria-labelledby="log-h" style={{ borderTop: "1px solid var(--line)" }}>
      <div className="wrap">
        <Reveal><p className="mono kicker">Studio log</p></Reveal>
        <Reveal delay={0.05} className="grid-2" style={{ marginTop: 22, alignItems: "end", marginBottom: 40 }}>
          <h2 id="log-h" className="display h2"><Words text="What shipped," /> <em>in public.</em></h2>
          <p className="lede">Transparency is one of the tenets, so here is the ledger. Short, dated, and only things that actually happened.</p>
        </Reveal>
        <Reveal className="log" delay={0.1}>
          {ENTRIES.map((e) => (
            <div className="entry" key={e.d + e.t}>
              <div className="sha"><time dateTime={e.d}>{fmt(e.d)}</time></div>
              <h3>{e.href ? <a href={e.href} target="_blank" rel="noopener noreferrer">{e.t} ↗</a> : e.t}</h3>
              <p>{e.p}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
