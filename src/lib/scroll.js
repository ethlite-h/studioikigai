import { useEffect, useRef, useState } from "react";

/* One shared rAF-throttled scroll loop. Subscribers get (scrollY, viewportHeight). */
const subs = new Set();
let ticking = false;
let vh = typeof window !== "undefined" ? window.innerHeight : 800;

function fire() {
  ticking = false;
  const y = window.scrollY || window.pageYOffset || 0;
  subs.forEach((fn) => fn(y, vh));
}
function onScroll() {
  if (!ticking) { ticking = true; requestAnimationFrame(fire); }
}
function onResize() { vh = window.innerHeight; onScroll(); }

export function subscribeScroll(fn) {
  if (subs.size === 0 && typeof window !== "undefined") {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
  }
  subs.add(fn);
  fn(window.scrollY || 0, vh);
  return () => {
    subs.delete(fn);
    if (subs.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    }
  };
}

/* Progress of a tall "pinned" section: 0 when its top hits the viewport top,
   1 when its bottom hits the viewport bottom. Written into a ref (no re-render). */
export function usePinProgress(ref) {
  const progress = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return subscribeScroll((y, h) => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - h;
      const p = total > 0 ? -rect.top / total : 0;
      progress.current = Math.min(1, Math.max(0, p));
    });
  }, [ref]);
  return progress;
}

/* Boolean visibility, plus optional callback. Used to pause canvases offscreen. */
export function useInView(ref, rootMargin = "0px", once = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (once && e.isIntersecting) obs.disconnect();
    }, { rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches;
