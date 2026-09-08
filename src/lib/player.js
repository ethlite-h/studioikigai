/* One shared <audio> for "She Rises!". Listen.jsx drives it; SingPhone.jsx reads it. */
import song from "../data/she-rises.json";

const subs = new Set();
const st = { state: "idle", time: 0, duration: song.duration, audio: null };

function emit() { subs.forEach((fn) => fn(st)); }
function ensure() {
  if (st.audio || typeof Audio === "undefined") return st.audio;
  const a = new Audio();
  a.preload = "none"; a.src = song.src;
  a.addEventListener("loadedmetadata", () => { st.duration = a.duration || song.duration; emit(); });
  a.addEventListener("timeupdate", () => { st.time = a.currentTime; emit(); });
  a.addEventListener("playing", () => { st.state = "playing"; emit(); });
  a.addEventListener("pause", () => { if (st.state !== "idle") st.state = "paused"; emit(); });
  a.addEventListener("ended", () => { st.state = "idle"; st.time = 0; emit(); });
  a.addEventListener("error", () => { st.state = "idle"; emit(); });
  st.audio = a;
  return a;
}

export const player = {
  song,
  get: () => st,
  subscribe(fn) { subs.add(fn); fn(st); return () => subs.delete(fn); },
  /* live time, smoother than timeupdate's ~4 Hz */
  now: () => (st.audio && st.state === "playing" ? st.audio.currentTime : st.time),
  toggle() {
    const a = ensure(); if (!a) return;
    if (st.state === "playing") { a.pause(); return; }
    st.state = "loading"; emit();
    a.play().catch(() => { st.state = "idle"; emit(); });
  },
  seek(t) { const a = ensure(); if (!a) return; a.currentTime = t; st.time = t; emit(); },
  stop() { st.audio?.pause(); },
};
