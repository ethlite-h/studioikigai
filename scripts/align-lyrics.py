"""Forced-align she-rises-lyrics.txt to a 16 kHz mono WAV of the lead vocal with stable-ts, estimate a pitch per word,
and write src/data/she-rises.json.

  python3 -m venv .venv && .venv/bin/pip install stable-ts
  ffmpeg -i "0 Lead Vocals.mp3" -ac 1 -ar 16000 vocals16k.wav
  PATH="$PWD/node_modules/ffmpeg-static:$PATH" .venv/bin/python scripts/align-lyrics.py small vocals16k.wav
"""
import json, re, sys, wave
import numpy as np
import stable_whisper

import os; HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
OUT = HERE + "../src/data/she-rises.json"
DURATION = 136.77

# ── lyrics: sections + lines ──
lines, sec = [], None
for raw in open(HERE + "she-rises-lyrics.txt"):
    s = raw.strip()
    if not s: continue
    m = re.match(r"^\[(.+)\]$", s)
    if m: sec = m.group(1); continue
    lines.append({"sec": sec, "text": s, "words": s.split()})
text = "\n".join(l["text"] for l in lines)

# ── align ──
model = stable_whisper.load_model(sys.argv[1] if len(sys.argv) > 1 else "small")
res = model.align(sys.argv[2], text, language="en", vad=False, original_split=True)
aw = [w for seg in res.segments for w in seg.words]
print("aligned words:", len(aw), "lyric words:", sum(len(l["words"]) for l in lines))

# ── pitch per word: simple autocorrelation f0 on the 16 kHz mono stem ──
wf = wave.open(sys.argv[2]); sr = wf.getframerate()
pcm = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
def f0(t0, t1):
    a, b = int(t0 * sr), int(t1 * sr)
    if b - a < 800: return None
    seg = pcm[a:b]; frame = 1024; hop = 256; est = []
    for i in range(0, len(seg) - frame, hop):
        x = seg[i:i + frame]; x = x - x.mean()
        if np.sqrt((x ** 2).mean()) < 0.02: continue
        ac = np.correlate(x, x, "full")[frame - 1:]; ac /= (ac[0] + 1e-9)
        lo, hi = int(sr / 1000), int(sr / 80)  # 80–1000 Hz
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.5: est.append(sr / k)
    if not est: return None
    hz = float(np.median(est)); return 69 + 12 * np.log2(hz / 440)

# ── map aligned words back onto lyric lines ──
out = {"title": "She Rises!", "artist": "Helen Ma", "duration": DURATION, "src": "/media/she-rises.m4a", "phrases": []}
i = 0; prev_note = 67
for l in lines:
    ws = []
    for tok in l["words"]:
        if i >= len(aw): break
        w = aw[i]; i += 1
        n = f0(w.start, w.end); n = int(round(n)) if n else prev_note; prev_note = n
        ws.append({"t": tok, "s": round(w.start, 2), "e": round(w.end, 2), "n": n})
    if not ws: continue
    out["phrases"].append({"sec": l["sec"], "s": ws[0]["s"], "e": ws[-1]["e"], "w": ws})
json.dump(out, open(OUT, "w"), separators=(",", ":"))
for p in out["phrases"]:
    print(f'{p["s"]:7.2f}-{p["e"]:7.2f} {p["sec"]:<10} {" ".join(w["t"] for w in p["w"])}  notes={min(w["n"] for w in p["w"])}-{max(w["n"] for w in p["w"])}')
