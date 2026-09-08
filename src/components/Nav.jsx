import { useEffect, useState } from "react";
import { Seal } from "./Seal.jsx";
import { subscribeScroll } from "../lib/scroll.js";

const LINKS = [
  ["#thesis", "Thesis"],
  ["#math", "The math"],
  ["#products", "Products"],
  ["#builder", "Builder"],
  ["#log", "Log"],
  ["#essay", "Essay"],
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => subscribeScroll((y) => setSolid(y > 40)), []);
  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.classList.remove("no-scroll"); };
  }, [open]);

  return (
    <>
      <header className={`nav ${solid || open ? "solid" : ""} ${open ? "open" : ""}`}>
        <div className="wrap bar">
          <a className="brand" href="#top" aria-label="Studio Ikigai, back to top" onClick={() => setOpen(false)}>
            <Seal size={30} />
            <span>Studio Ikigai</span>
          </a>
          <nav className="links" aria-label="Primary">
            {LINKS.map(([h, l]) => <a key={h} href={h}>{l}</a>)}
          </nav>
          <button className="burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            <span>{open ? "Close" : "Menu"}</span><i />
          </button>
        </div>
      </header>
      <div id="menu" className={`menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <ol>
          {LINKS.map(([h, l], i) => (
            <li key={h}><a href={h} style={{ "--d": `${0.08 + i * 0.06}s` }} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>{l}</a></li>
          ))}
        </ol>
        <div className="foot">
          <div className="thin-note">Independent software studio<br />Micro Tech, made by hand</div>
          <a className="btn seal" href="mailto:info@studioikigai.ai" tabIndex={open ? 0 : -1}><span>Say hello</span><span className="arr">→</span></a>
        </div>
      </div>
    </>
  );
}
