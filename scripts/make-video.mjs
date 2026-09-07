// Generates public/media/voiceprint.mp4 + poster.
// A short melody ("She Rises!" motif) is synthesised in Node, written to WAV,
// then rendered by ffmpeg as a scrolling spectrogram, inverted and tinted so it
// reads as ink on paper. Run: node scripts/make-video.mjs
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");

const SR = 44100;
const DUR = 12; // seconds, loops cleanly
const N = SR * DUR;

// D major, rising motif. [midi, beats]
const melody = [
  [62, 1], [66, 1], [69, 1], [74, 2], [73, 0.5], [71, 0.5], [69, 1],
  [66, 1], [67, 1], [69, 1], [71, 1], [74, 2], [76, 1], [74, 1],
  [69, 1], [71, 0.5], [73, 0.5], [74, 1], [78, 2], [76, 1], [74, 1],
];
const BPM = 96;
const beat = 60 / BPM;
const f = (m) => 440 * Math.pow(2, (m - 69) / 12);

const L = new Float32Array(N);
const R = new Float32Array(N);
let t0 = 0;
for (const [m, b] of melody) {
  const len = b * beat;
  const freq = f(m);
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, Math.floor((t0 + len) * SR));
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const a = Math.min(1, t / 0.06) * Math.min(1, (len - t) / 0.12); // envelope
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.4);
    const ph = 2 * Math.PI * freq * vib * t;
    // vocal-ish formant stack
    const v =
      Math.sin(ph) * 0.55 +
      Math.sin(2 * ph) * 0.28 +
      Math.sin(3 * ph) * 0.14 +
      Math.sin(4 * ph) * 0.07 +
      Math.sin(5 * ph) * 0.04;
    const breath = (Math.random() * 2 - 1) * 0.015;
    L[i] += (v + breath) * a * 0.5;
    R[i] += (Math.sin(ph + Math.PI / 2) * 0.55 + Math.sin(2 * ph) * 0.2) * a * 0.5;
  }
  t0 += len;
}
// gentle room
for (let i = 2200; i < N; i++) { L[i] += L[i - 2200] * 0.18; R[i] += R[i - 2600] * 0.18; }

const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.max(-1, Math.min(1, L[i])) * 32767, i * 4);
  pcm.writeInt16LE(Math.max(-1, Math.min(1, R[i])) * 32767, i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write("RIFF", 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write("WAVE", 8);
hdr.write("fmt ", 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write("data", 36); hdr.writeUInt32LE(pcm.length, 40);

const out = new URL("../public/media/", import.meta.url).pathname;
if (!existsSync(out)) mkdirSync(out, { recursive: true });
const wav = (process.env.TMPDIR || "/tmp") + "/voiceprint.wav";
writeFileSync(wav, Buffer.concat([hdr, pcm]));

// Paper #F3EFE6 (243,239,230) -> Ink #1A1714 (26,23,20). Map grey intensity to that ramp.
const tint =
  "geq=" +
  "r='243-(243-26)*p(X\\,Y)/255':" +
  "g='239-(239-23)*p(X\\,Y)/255':" +
  "b='230-(230-20)*p(X\\,Y)/255'";

const common = ["-y", "-hide_banner", "-loglevel", "error", "-i", wav];

// 1) scrolling spectrogram = literal voice print
execFileSync(ffmpeg, [
  ...common,
  "-filter_complex",
  `[0:a]showspectrum=s=1280x720:slide=scroll:mode=combined:color=intensity:scale=sqrt:gain=1.4:fscale=log:win_func=blackman:overlap=0.95:legend=0,format=gray,eq=contrast=1.6:brightness=-0.12,${tint},gblur=sigma=0.5,format=yuv420p[v]`,
  "-map", "[v]", "-an", "-r", "30", "-t", String(DUR),
  "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-movflags", "+faststart",
  out + "voiceprint.mp4",
], { stdio: "inherit" });

// 2) ink waveform (centre-filled) for a second texture
execFileSync(ffmpeg, [
  ...common,
  "-filter_complex",
  `color=c=0xF3EFE6:s=1920x540:r=30[bg];[0:a]showwaves=s=1920x540:mode=p2p:colors=0x1A1714:rate=30:scale=lin:draw=full:n=1[w];[bg][w]overlay=format=auto,gblur=sigma=1.4,scale=1280:360,format=yuv420p[v]`,
  "-map", "[v]", "-an", "-r", "30", "-t", String(DUR),
  "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-movflags", "+faststart",
  out + "waveform.mp4",
], { stdio: "inherit" });

// posters + preview frames
execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-ss", "6", "-i", out + "voiceprint.mp4", "-frames:v", "1", "-q:v", "4", out + "voiceprint.jpg"], { stdio: "inherit" });
execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-ss", "6", "-i", out + "waveform.mp4", "-frames:v", "1", "-q:v", "4", out + "waveform.jpg"], { stdio: "inherit" });
console.log("done");
