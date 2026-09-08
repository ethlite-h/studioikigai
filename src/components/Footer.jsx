import { Seal } from "./Seal.jsx";

export function Footer() {
  return (
    <footer className="footer lower">
      <div className="wrap">
        <div className="top">
          <div className="col" style={{ gap: 24 }}>
            <Seal size={44} />
            <p className="big">Make something<br />for <a href="mailto:info@studioikigai.ai">ten thousand people.</a></p>
          </div>
          <div className="col">
            <span className="mono">Products</span>
            <a href="https://getantiviral.app" target="_blank" rel="noopener noreferrer">Antiviral</a>
            <a href="https://findyourinnervoice.app" target="_blank" rel="noopener noreferrer">Inner Voice</a>
            <a href="#sing">Inner Voice Sing!</a>
          </div>
          <div className="col">
            <span className="mono">Studio</span>
            <a href="#thesis">Thesis</a>
            <a href="#builder">The builder</a>
            <a href="#log">Studio log</a>
            <a href="#manifesto">Tenets</a>
            <a href="https://ethlite.substack.com/p/software-engineerings-podcast-moment" target="_blank" rel="noopener noreferrer">Essay ↗</a>
          </div>
          <div className="col">
            <span className="mono">Contact</span>
            <a href="mailto:info@studioikigai.ai">info@studioikigai.ai</a>
            <a href="https://ethlite.substack.com" target="_blank" rel="noopener noreferrer">Substack ↗</a>
            <a href="https://linkedin.com/in/ethlite" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          </div>
        </div>
        <div className="bottom">
          <span>© 2026 Studio Ikigai · 生き甲斐</span>
          <span>No cookies. No trackers. Just a page-view counter.</span>
          <span>Made by hand, with a little help</span>
        </div>
      </div>
    </footer>
  );
}
