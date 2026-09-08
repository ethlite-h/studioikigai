import { useEffect, useState } from "react";
import { player } from "../lib/player.js";

/* Plays the whole of "She Rises!" (2:50, from the studio's own stems). Loads nothing until pressed. */
export function Listen({ label = "Hear She Rises!" }) {
  const [s, setS] = useState(player.get());
  useEffect(() => player.subscribe((st) => setS({ ...st })), []);
  useEffect(() => () => player.stop(), []);
  const pct = s.duration ? (s.time / s.duration) * 100 : 0;
  const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}`;
  return (
    <button type="button" className={`listen ${s.state}`} onClick={() => player.toggle()} aria-pressed={s.state === "playing"}>
      <span className="ring" style={{ "--p": `${pct}%` }} aria-hidden="true"><i className="glyph" /></span>
      <span className="txt">
        <b>{s.state === "playing" ? "Playing" : s.state === "paused" ? "Paused" : s.state === "loading" ? "Loading" : label}</b>
        <span className="sr-only">{s.state === "playing" ? ", press to pause" : ", press to play the song"}</span>
        <small>{s.state === "idle" ? `Her voice · ${mmss(s.duration)}` : `${mmss(s.time)} / ${mmss(s.duration)}`}</small>
      </span>
    </button>
  );
}
