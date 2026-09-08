import { useEffect, useRef, useState } from "react";

/* Plays the 32-second clip of "She Rises!". Loads nothing until pressed. */
export function Listen({ src = "/media/she-rises-clip.m4a", label = "Hear She Rises!" }) {
  const audio = useRef(null);
  const [state, setState] = useState("idle"); // idle | loading | playing | paused
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(32);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => setT(a.currentTime);
    const onMeta = () => setDur(a.duration || 32);
    const onEnd = () => { setState("idle"); setT(0); };
    const onPlay = () => setState("playing");
    const onPause = () => setState((s) => (s === "idle" ? s : "paused"));
    a.addEventListener("timeupdate", onTime); a.addEventListener("loadedmetadata", onMeta); a.addEventListener("ended", onEnd);
    a.addEventListener("playing", onPlay); a.addEventListener("pause", onPause);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("ended", onEnd); a.removeEventListener("playing", onPlay); a.removeEventListener("pause", onPause); a.pause(); };
  }, []);

  const toggle = () => {
    const a = audio.current;
    if (state === "playing") { a.pause(); return; }
    setState("loading");
    a.play().catch(() => setState("idle"));
  };
  const pct = dur ? (t / dur) * 100 : 0;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <button type="button" className={`listen ${state}`} onClick={toggle} aria-pressed={state === "playing"}>
      <audio ref={audio} src={src} preload="none" />
      <span className="ring" style={{ "--p": `${pct}%` }} aria-hidden="true">
        <i className="glyph" />
      </span>
      <span className="txt">
        <b>{state === "playing" ? "Playing" : state === "paused" ? "Paused" : state === "loading" ? "Loading" : label}</b>
        <span className="sr-only">{state === "playing" ? ", press to pause" : ", press to play a 32-second clip"}</span>
        <small>{state === "idle" ? `Her voice · ${mmss(dur)} clip` : `${mmss(t)} / ${mmss(dur)}`}</small>
      </span>
    </button>
  );
}
