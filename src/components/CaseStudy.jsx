import { Reveal, Words } from "../lib/Reveal.jsx";

/* Sing! as a commit log: the Ship of Theseus story from the essay. */
const LOG = [
  { sha: "phase/01", when: "port", h: "Port UltraStar to iOS", p: "The open-source karaoke engine, rebuilt in Swift with Claude Code. Then rebuilt again, piece by piece, until nothing of the original was left. A virtual Ship of Theseus.", add: "+11,204", del: "−9,870" },
  { sha: "phase/02", when: "format", h: "A song format of our own", p: "Lyrics with the formatting singers actually need, timing that survives a tempo change, and visuals driven by BPM instead of a timeline.", add: "+2,318", del: "−604" },
  { sha: "phase/03", when: "assess", h: "Vocal assessment, on the phone", p: "Enunciation, pitch accuracy and rhythmic timing, scored by models running locally. No API calls. No latency. No bill.", add: "+4,772", del: "−1,109" },
  { sha: "phase/04", when: "generate", h: "Describe a song. Sing it.", p: "A generation front end: you describe the track, the AI writes an instrumental, you transpose it into your range and record the vocal. Your song, your lyrics, your voice.", add: "+3,051", del: "−212" },
];

export function CaseStudy() {
  return (
    <section id="theseus" className="section lower" aria-labelledby="theseus-h">
      <div className="wrap">
        <Reveal><p className="mono kicker">How Sing! was built</p></Reveal>
        <Reveal delay={0.05} className="grid-2" style={{ marginTop: 22, alignItems: "end", marginBottom: 48 }}>
          <h2 id="theseus-h" className="display h2"><Words text="A ship of" /> <em>Theseus,</em> <Words text="in four commits." /></h2>
          <p className="lede">Total build cost: less than one day of a big-tech engineer's salary. Mostly a Claude subscription. Here's the log.</p>
        </Reveal>

        <Reveal className="log" delay={0.1}>
          {LOG.map((e) => (
            <div className="entry" key={e.sha}>
              <div className="sha">{e.sha}<small>{e.when}</small></div>
              <h3>{e.h}</h3>
              <div>
                <p>{e.p}</p>
                <div className="diff"><span className="add">{e.add}</span><span className="del">{e.del}</span><span>swift · coreml</span></div>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal className="stats" delay={0.15} style={{ marginTop: 48 }}>
          <div><span className="v"><em>1</em></span><span className="mono">Engineer</span></div>
          <div><span className="v">0</span><span className="mono">Servers, API calls</span></div>
          <div><span className="v">&lt;1<span style={{ fontSize: "0.5em" }}> day</span></span><span className="mono">Big-tech salary spent</span></div>
          <div><span className="v">10k<span style={{ fontSize: "0.5em" }}>+</span></span><span className="mono">Singers it's sized for</span></div>
        </Reveal>
      </div>
    </section>
  );
}
