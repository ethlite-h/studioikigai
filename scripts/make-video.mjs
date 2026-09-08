// Generates public/media assets with the bundled ffmpeg-static binary.
//   node scripts/make-video.mjs                 → synthesised melody (no song on disk)
//   SONG="/path/She Rises!.mp3" node scripts/make-video.mjs
//                                                 → real song: 32 s listening clip,
//                                                   spectrogram + waveform videos, posters
// CLIP_START (seconds) picks where the clip begins; default 94 (the loudest 30 s).
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");

const out = new URL("../public/media/", import.meta.url).pathname;
if (!existsSync(out)) mkdirSync(out, { recursive: true });
const run = (args) => execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });

const SONG = process.env.SONG;
const CLIP_START = Number(process.env.CLIP_START ?? 94);
const CLIP_LEN = 32;
const VID_LEN = 12;

let src, srcOffset;
if (SONG && existsSync(SONG)) {
  // 1) the listening clip: AAC, fades in and out
  run(["-ss", String(CLIP_START), "-t", String(CLIP_LEN), "-i", SONG,
    "-af", `afade=t=in:d=1.2,afade=t=out:st=${CLIP_LEN - 2}:d=2,loudnorm=I=-16:TP=-1.5`,
    "-c:a", "aac", "-b:a", "112k", "-movflags", "+faststart", out + "she-rises-clip.m4a"]);
  src = SONG; srcOffset = CLIP_START;
  console.log("clip from real song at", CLIP_START, "s");
} else {
  src = synth(); srcOffset = 0;
  console.log("no SONG given, using synthesised melody");
}

// Paper #F3EFE6 → Ink #1A1714 ramp for grey intensity
const tint = "geq=r='243-(243-26)*p(X\\,Y)/255':g='239-(239-23)*p(X\\,Y)/255':b='230-(230-20)*p(X\\,Y)/255'";
const input = ["-ss", String(srcOffset), "-t", String(VID_LEN), "-i", src];
const inputShort = ["-ss", String(srcOffset), "-t", "8", "-i", src];

// 2) scrolling spectrogram: a literal voice print
run([...input, "-filter_complex",
  `[0:a]${SONG ? "highpass=f=240," : ""}showspectrum=s=1280x720:slide=scroll:mode=combined:color=intensity:scale=sqrt:gain=${SONG ? 0.8 : 1.4}:fscale=log:win_func=blackman:overlap=0.9:legend=0,format=gray,eq=contrast=${SONG ? 1.35 : 1.6}:brightness=${SONG ? -0.08 : -0.12},${tint},gblur=sigma=0.6,format=yuv420p[v]`,
  "-map", "[v]", "-an", "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-movflags", "+faststart", out + "voiceprint.mp4"]);

// 3) ink oscilloscope line
run([...inputShort, "-filter_complex",
  `color=c=0xF3EFE6:s=960x270:r=25[bg];[0:a]aformat=channel_layouts=mono,lowpass=f=900,showwaves=s=960x270:mode=p2p:colors=0x1A1714:scale=lin:draw=full:n=2[w];[bg][w]overlay=format=auto:shortest=1,gblur=sigma=1.1,format=yuv420p[v]`,
  "-map", "[v]", "-an", "-t", "8", "-c:v", "libx264", "-preset", "veryfast", "-crf", "33", "-movflags", "+faststart", out + "waveform.mp4"]);

// posters
run(["-ss", "6", "-i", out + "voiceprint.mp4", "-frames:v", "1", "-q:v", "4", out + "voiceprint.jpg"]);
run(["-ss", "6", "-i", out + "waveform.mp4", "-frames:v", "1", "-q:v", "4", out + "waveform.jpg"]);
console.log("done");

/* Fallback: a rising motif with vocal-ish harmonics, written to a temp WAV. */
function synth() {
  const SR = 44100, DUR = 12, N = SR * DUR;
  const melody = [[62, 1], [66, 1], [69, 1], [74, 2], [73, 0.5], [71, 0.5], [69, 1], [66, 1], [67, 1], [69, 1], [71, 1], [74, 2], [76, 1], [74, 1], [69, 1], [71, 0.5], [73, 0.5], [74, 1], [78, 2], [76, 1], [74, 1]];
  const beat = 60 / 96, f = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const L = new Float32Array(N), R = new Float32Array(N);
  let t0 = 0;
  for (const [m, b] of melody) {
    const len = b * beat, freq = f(m), s0 = Math.floor(t0 * SR), s1 = Math.min(N, Math.floor((t0 + len) * SR));
    for (let i = s0; i < s1; i++) {
      const t = (i - s0) / SR, a = Math.min(1, t / 0.06) * Math.min(1, (len - t) / 0.12);
      const ph = 2 * Math.PI * freq * (1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.4)) * t;
      const v = Math.sin(ph) * 0.55 + Math.sin(2 * ph) * 0.28 + Math.sin(3 * ph) * 0.14 + Math.sin(4 * ph) * 0.07;
      L[i] += (v + (Math.random() - 0.5) * 0.03) * a * 0.5; R[i] += (Math.sin(ph + 1.57) * 0.55 + Math.sin(2 * ph) * 0.2) * a * 0.5;
    }
    t0 += len;
  }
  const pcm = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) { pcm.writeInt16LE(Math.max(-1, Math.min(1, L[i])) * 32767, i * 4); pcm.writeInt16LE(Math.max(-1, Math.min(1, R[i])) * 32767, i * 4 + 2); }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  const wav = (process.env.TMPDIR || "/tmp") + "/voiceprint.wav";
  writeFileSync(wav, Buffer.concat([h, pcm]));
  return wav;
}
