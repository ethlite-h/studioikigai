import { useRef, useEffect, useState } from "react";
import { reducedMotion } from "./scroll.js";

/* Adds .is-in once the element scrolls into view. CSS does the animating. */
export function Reveal({ as: Tag = "div", className = "", delay = 0, children, threshold = 0.15, ...rest }) {
  const ref = useRef(null);
  const [on, setOn] = useState(() => reducedMotion());
  useEffect(() => {
    if (on) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setOn(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); obs.disconnect(); }
    }, { threshold, rootMargin: "0px 0px -8% 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [on, threshold]);
  return (
    <Tag ref={ref} className={`reveal ${on ? "is-in" : ""} ${className}`} style={{ "--d": `${delay}s` }} {...rest}>
      {children}
    </Tag>
  );
}

/* Splits text into words, each masked and sliding up with a stagger. */
export function Words({ text, className = "", delay = 0, stagger = 0.035, as: Tag = "span", mount = false }) {
  const words = text.split(" ");
  return (
    <Tag className={`words ${className} ${mount ? "mount" : ""}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w" aria-hidden="true"><span style={{ "--d": `${delay + i * stagger}s` }}>{w}</span></span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
