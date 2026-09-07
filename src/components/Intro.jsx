import { useEffect, useState } from "react";
import { Seal } from "./Seal.jsx";
import { reducedMotion } from "../lib/scroll.js";

/* One-second stamp on first visit of the session. Never again after that. */
export function Intro() {
  const [show] = useState(() => {
    if (location.search.includes("shot=1")) { document.documentElement.classList.add("shot"); return false; }
    try { return !sessionStorage.getItem("ikigai-intro") && !reducedMotion(); } catch { return true; }
  });
  const [done, setDone] = useState(!show);
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem("ikigai-intro", "1"); } catch {}
    const t = setTimeout(() => setDone(true), 1150);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div className={`intro ${done ? "done" : ""}`} aria-hidden="true">
      <div className="mark">
        <div className="seal"><Seal size={64} /></div>
        <div className="name">Studio Ikigai</div>
      </div>
    </div>
  );
}
