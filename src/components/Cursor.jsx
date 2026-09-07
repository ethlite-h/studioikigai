import { useEffect, useRef } from "react";
import { isTouch, reducedMotion } from "../lib/scroll.js";

/* Vermilion dot that follows a fine pointer and swells over links. Absent on touch. */
export function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    if (isTouch() || reducedMotion()) return;
    const el = ref.current;
    let x = 0, y = 0, tx = 0, ty = 0, raf;
    const move = (e) => { tx = e.clientX; ty = e.clientY; el.classList.add("on"); };
    const over = (e) => el.classList.toggle("hover", !!e.target.closest?.("a, button, input, .phone"));
    const loop = () => { x += (tx - x) * 0.35; y += (ty - y) * 0.35; el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; raf = requestAnimationFrame(loop); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("mouseleave", () => el.classList.remove("on"));
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over); cancelAnimationFrame(raf); };
  }, []);
  return <div className="cursor" ref={ref} aria-hidden="true" />;
}
