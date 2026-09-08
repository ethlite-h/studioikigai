import { Reveal } from "../lib/Reveal.jsx";

const Apple = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.417 2.2-1.24 3.18-.99 1.16-2.19 1.83-3.49 1.72a3.52 3.52 0 0 1-.03-.43c0-1.1.48-2.27 1.33-3.22.42-.48.96-.88 1.6-1.2.65-.32 1.26-.5 1.84-.53.02.16.03.32.03.48zm3.95 16.3c-.6 1.38-.88 2-1.65 3.2-1.07 1.68-2.58 3.77-4.45 3.79-1.66.02-2.09-1.09-4.34-1.08-2.26.01-2.73 1.1-4.4 1.08-1.87-.02-3.3-1.9-4.37-3.58C-1.92 16.6-2.24 10.9.62 7.9c1.37-1.45 3.16-2.3 4.84-2.3 1.7 0 2.78 1.1 4.19 1.1 1.37 0 2.2-1.1 4.18-1.1 1.5 0 3.08.82 4.2 2.23-3.7 2.03-3.1 7.32.26 8.6z"/></svg>
);
const Swift = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.9c.1-.4.2-.8.2-1.3 0-.2 0-.4-.1-.6.8-2.7-.1-5.5-1.7-7.6.9 1.5 1.3 3.2 1.1 4.7C16.8 7.3 13.5 4.5 11 2.5c1.5 1.9 3.6 4.4 5.2 6.6-3-1.6-6.4-4-9.2-6.4 2.2 2.9 4.7 5.8 7.5 8.3C9.4 9.1 5.3 5.7 3 3.8c3 4 7.6 8.7 12.3 11-3.1 1.5-7.2 1.6-11.3-.5 4.8 4.3 10.8 5.2 14.6 2.7 1 .2 2.2.6 3.4 1.6-.5-1.5-1.3-2.9-1.5-3.7z"/></svg>
);
const Spark = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>);
const Chip = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h2v3h6V3h2v3h1a2 2 0 0 1 2 2v1h3v2h-3v2h3v2h-3v1a2 2 0 0 1-2 2h-1v3h-2v-3H9v3H7v-3H6a2 2 0 0 1-2-2v-1H1v-2h3v-2H1V9h3V8a2 2 0 0 1 2-2h1V3zm2 6v6h6V9H9z"/></svg>);
const Brain = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2a3 3 0 0 0-3 3v.3A3.5 3.5 0 0 0 4 8.5c0 .7.2 1.3.5 1.9A3.5 3.5 0 0 0 3 13.5c0 1.4.8 2.6 2 3.2V17a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm6 0a3 3 0 0 1 3 3v.3a3.5 3.5 0 0 1 2 3.2c0 .7-.2 1.3-.5 1.9a3.5 3.5 0 0 1 1.5 3.1c0 1.4-.8 2.6-2 3.2V17a3 3 0 0 1-3 3h-1a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/></svg>);
const Vercel = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l11 19H1z"/></svg>);

export function Stack() {
  return (
    <section className="section tight lower" aria-label="Technology" style={{ borderTop: "1px solid var(--line)" }}>
      <div className="wrap stack" style={{ "--gap": "28px" }}>
        <Reveal><p className="mono" style={{ textAlign: "center" }}>The intelligence runs on your device</p></Reveal>
        <Reveal delay={0.05} className="stack-strip">
          <span className="mark"><Apple /> iPhone & Mac</span>
          <span className="mark"><Swift /> Swift</span>
          <span className="mark"><Brain /> Apple Foundation Models</span>
          <span className="mark"><Chip /> Core ML</span>
          <span className="mark"><Spark /> Claude Code</span>
          <span className="mark"><Vercel /> Vercel</span>
        </Reveal>
      </div>
    </section>
  );
}
