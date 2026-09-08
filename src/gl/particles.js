/*
  Raw WebGL point cloud (no library). Three shapes baked as attributes:
    A — one dense mass           (one product, a billion users)
    B — scattered                (the cost floor drops)
    C — dozens of small clusters (Micro Tech)
  uProgress 0→2 mixes A→B→C in the vertex shader.
  The pointer repels nearby points; a tap or click pulls points into a
  temporary vermilion cluster ("found a studio").
*/

const VERT = `
attribute vec3 aA; attribute vec3 aB; attribute vec3 aC;
attribute float aSeed; attribute float aOurs;
uniform mat4 uProj; uniform mat4 uView;
uniform float uTime, uProgress, uPixelRatio, uSize, uPulse, uRepel, uClickT;
uniform vec2 uSpread, uPointer, uClick, uRot;
uniform float uLift;
varying float vOurs; varying float vFade;
float ease(float t) { return t * t * (3.0 - 2.0 * t); }
void main() {
  float t1 = ease(clamp(uProgress, 0.0, 1.0));
  float t2 = ease(clamp(uProgress - 1.0, 0.0, 1.0));
  vec3 pos = mix(mix(aA, aB, t1), aC * vec3(uSpread, 1.0), t2);
  float wild = sin(3.14159 * t1) * (1.0 - t2);
  float amp = 0.035 + 0.9 * wild + 0.02 * t2;
  pos += amp * vec3(sin(uTime * 0.7 + aSeed * 6.2831), cos(uTime * 0.55 + aSeed * 12.566), sin(uTime * 0.45 + aSeed * 3.1));
  pos *= 1.0 + uPulse * 0.05 * (1.0 - t1) * sin(uTime * 2.0 + aSeed);
  // slow spin + pointer tilt
  float r = uTime * 0.04 + uRot.x; float cs = cos(r), sn = sin(r);
  pos.xz = mat2(cs, -sn, sn, cs) * pos.xz;
  float rx = uRot.y; cs = cos(rx); sn = sin(rx);
  pos.yz = mat2(cs, -sn, sn, cs) * pos.yz;
  pos.y += uLift;
  // pointer repel (world xy on the z=0 plane)
  vec2 d = pos.xy - uPointer; float len = length(d) + 1e-4;
  pos.xy += (d / len) * smoothstep(1.1, 0.0, len) * 0.55 * uRepel;
  // tap: gather into a small cluster that fades over a few seconds
  float age = uTime - uClickT;
  float env = uClickT < 0.0 ? 0.0 : exp(-age * 0.55) * (1.0 - exp(-age * 5.0));
  vec2 dc = pos.xy - uClick; float lc = length(dc) + 1e-4;
  float w = smoothstep(1.6, 0.0, lc) * env;
  vec2 target = uClick + (dc / lc) * (0.12 + 0.22 * fract(aSeed * 13.0));
  pos.xy = mix(pos.xy, target, w);
  vec4 mv = uView * vec4(pos, 1.0);
  gl_Position = uProj * mv;
  float size = uSize * (1.0 + 0.6 * max(aOurs * t2, w)) * (0.7 + 0.6 * fract(aSeed * 7.0));
  gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);
  vOurs = max(aOurs * t2, w);
  vFade = 1.0 - 0.35 * wild;
}`;

const FRAG = `
precision mediump float;
uniform vec3 uInk, uSeal; uniform float uAlpha;
varying float vOurs; varying float vFade;
void main() {
  vec2 d = gl_PointCoord - 0.5; float r = dot(d, d) * 4.0;
  if (r > 1.0) discard;
  float a = (1.0 - smoothstep(0.45, 1.0, r)) * uAlpha * vFade;
  gl_FragColor = vec4(mix(uInk, uSeal, vOurs), a);
}`;

function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
const viewAt = (z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -z, 1]);

export function createParticles(canvas, { count = 14000, ink = "#1A1714", seal = "#C8371C" } = {}) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" });
  if (!gl) return null;

  // ── program ──
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const U = {}; for (const n of ["uProj", "uView", "uTime", "uProgress", "uPixelRatio", "uSize", "uPulse", "uRepel", "uClickT", "uSpread", "uPointer", "uClick", "uRot", "uLift", "uInk", "uSeal", "uAlpha"]) U[n] = gl.getUniformLocation(prog, n);

  // ── shapes ──
  const A = new Float32Array(count * 3), B = new Float32Array(count * 3), C = new Float32Array(count * 3);
  const seed = new Float32Array(count), ours = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const th = 2 * Math.PI * Math.random(), ph = Math.acos(2 * Math.random() - 1);
    const rr = 1.55 * (1 - Math.pow(Math.random(), 2.2) * 0.55);
    A.set([rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph)], i * 3);
    B.set([(Math.random() - 0.5) * 11, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 6 - 1], i * 3);
    seed[i] = Math.random();
  }
  const K = 44, clusters = [];
  for (let k = 0; k < K; k++) clusters.push({ x: ((k % 11) / 10 - 0.5) * 9.2 + (Math.random() - 0.5) * 1.2, y: (Math.floor(k / 11) / 3 - 0.5) * 5.2 + (Math.random() - 0.5) * 1.1, z: (Math.random() - 0.5) * 2.5, s: 0.12 + Math.pow(Math.random(), 2.2) * 0.42, w: 0.4 + Math.pow(Math.random(), 1.6) * 2.2 });
  const oursIdx = new Set(); while (oursIdx.size < 3) oursIdx.add(Math.floor(Math.random() * K));
  const totalW = clusters.reduce((s, c) => s + c.w, 0);
  let i = 0;
  clusters.forEach((c, k) => {
    const n = k === K - 1 ? count - i : Math.round((c.w / totalW) * count);
    for (let j = 0; j < n && i < count; j++, i++) { C.set([c.x + gauss() * c.s, c.y + gauss() * c.s * 0.85, c.z + gauss() * c.s * 0.6], i * 3); ours[i] = oursIdx.has(k) ? 1 : 0; }
  });
  const attr = (name, data, size) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); return b; };
  const buffers = [attr("aA", A, 3), attr("aB", B, 3), attr("aC", C, 3), attr("aSeed", seed, 1), attr("aOurs", ours, 1)];

  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DEPTH_TEST);
  gl.uniform3fv(U.uInk, hex(ink)); gl.uniform3fv(U.uSeal, hex(seal));
  gl.uniform1f(U.uClickT, -1);

  const pr = Math.min(window.devicePixelRatio || 1, 2);
  const FOV = (42 * Math.PI) / 180;
  const st = { target: 0, progress: 0, pulse: 0, pulseT: 0, px: 0, py: 0, tx: 0, ty: 0, running: false, raf: 0, w: 0, h: 0, camZ: 5, lift: 0, aspect: 1, pointer: [99, 99], repel: 0, repelT: 0, click: [0, 0], clickT: -1, t0: performance.now(), time: 0 };

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    if (w === st.w && h === st.h) return;
    st.w = w; st.h = h; canvas.width = w * pr; canvas.height = h * pr; gl.viewport(0, 0, canvas.width, canvas.height);
    const a = w / h; st.aspect = a; const portrait = a < 0.9;
    st.camZ = (portrait ? 2.7 : 3.2) / (Math.tan(FOV / 2) * Math.min(1, a));
    st.lift = portrait ? 1.15 : 0.7;
    gl.uniformMatrix4fv(U.uProj, false, perspective(FOV, a, 0.1, 60));
    gl.uniformMatrix4fv(U.uView, false, viewAt(st.camZ));
    gl.uniform2f(U.uSpread, Math.min(1, a / 1.55) * 0.95 + 0.05, a < 1 ? Math.min(1.9, 1 / a) : 1);
    gl.uniform1f(U.uSize, w < 700 ? 2.3 : 2.6);
    gl.uniform1f(U.uAlpha, w < 700 ? 0.95 : 0.85);
    gl.uniform1f(U.uLift, st.lift);
    gl.uniform1f(U.uPixelRatio, pr);
  }
  // screen (0..1) → world xy on the z=0 plane
  const toWorld = (nx, ny) => { const hh = st.camZ * Math.tan(FOV / 2); return [(nx * 2 - 1) * hh * st.aspect, (1 - ny * 2) * hh]; };

  function frame(now) {
    if (!st.running) return;
    st.raf = requestAnimationFrame(frame);
    resize();
    st.time = (now - st.t0) / 1000;
    st.progress += (st.target - st.progress) * 0.07;
    st.pulse += (st.pulseT - st.pulse) * 0.05;
    st.px += (st.tx - st.px) * 0.05; st.py += (st.ty - st.py) * 0.05;
    st.repel += (st.repelT - st.repel) * 0.08;
    gl.uniform1f(U.uTime, st.time); gl.uniform1f(U.uProgress, st.progress); gl.uniform1f(U.uPulse, st.pulse);
    gl.uniform2f(U.uRot, st.px * 0.25, st.py * 0.15);
    gl.uniform2f(U.uPointer, st.pointer[0], st.pointer[1]); gl.uniform1f(U.uRepel, st.repel);
    gl.uniform2f(U.uClick, st.click[0], st.click[1]); gl.uniform1f(U.uClickT, st.clickT);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  return {
    setProgress(v) { st.target = v; },
    setPulse(v) { st.pulseT = v; },
    /* nx, ny in 0..1 of the canvas; parallax tilt + repel field */
    setPointer(nx, ny, active = true) { st.tx = nx * 2 - 1; st.ty = ny * 2 - 1; st.pointer = toWorld(nx, ny); st.repelT = active ? 1 : 0; },
    clearPointer() { st.repelT = 0; },
    tap(nx, ny) { st.click = toWorld(nx, ny); st.clickT = st.time; },
    start() { if (!st.running) { st.running = true; st.t0 = performance.now() - st.time * 1000; st.raf = requestAnimationFrame(frame); } },
    stop() { st.running = false; cancelAnimationFrame(st.raf); },
    dispose() { this.stop(); buffers.forEach((b) => gl.deleteBuffer(b)); gl.deleteProgram(prog); gl.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}
