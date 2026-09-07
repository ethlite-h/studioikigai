import { Reveal, Words } from "../lib/Reveal.jsx";

const URL = "https://ethlite.substack.com/p/software-engineerings-podcast-moment";

export function Essay() {
  return (
    <section id="essay" className="section lower" aria-labelledby="essay-h" style={{ background: "var(--paper-2)" }}>
      <div className="wrap">
        <Reveal><p className="mono kicker">The thesis, in full</p></Reveal>
        <Reveal delay={0.05} style={{ marginTop: 22, marginBottom: 40 }}>
          <h2 id="essay-h" className="display h2" style={{ maxWidth: "16ch" }}><Words text="AI is software's" /> <em>podcast moment.</em></h2>
        </Reveal>
        <Reveal delay={0.1}>
          <a className="essay-card" href={URL} target="_blank" rel="noopener noreferrer">
            <div className="stack" style={{ "--gap": "16px" }}>
              <span className="src">
                <svg viewBox="0 0 24 24"><path d="M2 2h20v3H2zm0 5h20v3H2zm0 5h20v10l-10-5.5L2 22z"/></svg>
                ethlite on Substack
              </span>
              <h3>Software Engineering's Podcast Moment</h3>
              <p className="pull">“Podcasting didn't kill broadcasting. It grew in the spaces broadcasting couldn't profitably serve. When two or three people with AI tools can build and maintain what previously required twenty, the cost floor drops below the threshold where venture capital needs to be involved.”</p>
            </div>
            <span className="btn seal"><span>Read the essay</span><span className="arr">↗</span></span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
