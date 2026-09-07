import * as THREE from "three";

/*
  One point cloud, three "shapes" baked as attributes:
    A — a single dense mass          (one product, a billion users)
    B — scattered, unresolved        (the cost floor drops)
    C — dozens of small clusters     (Micro Tech)
  uProgress runs 0 → 2 and the vertex shader mixes A→B→C.
*/

const vert = /* glsl */ `
  attribute vec3 aA;
  attribute vec3 aB;
  attribute vec3 aC;
  attribute float aSeed;
  attribute float aOurs;
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2 uSpread;
  uniform float uPulse;
  varying float vOurs;
  varying float vFade;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    float p = uProgress;
    float t1 = ease(clamp(p, 0.0, 1.0));
    float t2 = ease(clamp(p - 1.0, 0.0, 1.0));
    vec3 c = aC * vec3(uSpread, 1.0);
    vec3 pos = mix(mix(aA, aB, t1), c, t2);

    // breathing: tight in the mass, wild in the chaos, calm in the clusters
    float wild = sin(3.14159 * t1) * (1.0 - t2);
    float amp = 0.035 + 0.9 * wild + 0.02 * t2;
    pos += amp * vec3(
      sin(uTime * 0.7 + aSeed * 6.2831),
      cos(uTime * 0.55 + aSeed * 12.566),
      sin(uTime * 0.45 + aSeed * 3.1)
    );
    // the mass pulses when it's "asked" to grow
    pos *= 1.0 + uPulse * 0.05 * (1.0 - t1) * sin(uTime * 2.0 + aSeed);

    // slow global rotation
    float r = uTime * 0.04;
    float cs = cos(r), sn = sin(r);
    pos.xz = mat2(cs, -sn, sn, cs) * pos.xz;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (1.0 + 0.6 * aOurs * t2) * (0.7 + 0.6 * fract(aSeed * 7.0));
    gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);
    vOurs = aOurs * t2;
    vFade = 1.0 - 0.35 * wild;
  }
`;

const frag = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uSeal;
  uniform float uAlpha;
  varying float vOurs;
  varying float vFade;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d) * 4.0;
    if (r > 1.0) discard;
    float a = (1.0 - smoothstep(0.45, 1.0, r)) * uAlpha * vFade;
    vec3 col = mix(uInk, uSeal, vOurs);
    gl_FragColor = vec4(col, a);
  }
`;

function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function createParticles(canvas, { count = 14000, ink = "#1A1714", seal = "#C8371C" } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);

  // ── shapes ──
  const A = new Float32Array(count * 3);
  const B = new Float32Array(count * 3);
  const Cc = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const ours = new Float32Array(count);

  // A: one heavy mass, denser toward the surface like a planet you can't see into
  for (let i = 0; i < count; i++) {
    const u = Math.random(), v = Math.random();
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    const rr = 1.55 * (1 - Math.pow(Math.random(), 2.2) * 0.55);
    A[i * 3] = rr * Math.sin(ph) * Math.cos(th);
    A[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th);
    A[i * 3 + 2] = rr * Math.cos(ph);
  }
  // B: blown apart
  for (let i = 0; i < count; i++) {
    B[i * 3] = (Math.random() - 0.5) * 11;
    B[i * 3 + 1] = (Math.random() - 0.5) * 7;
    B[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
  }
  // C: many small communities. Sizes follow a long tail — most are tiny.
  const K = 44;
  const clusters = [];
  for (let k = 0; k < K; k++) {
    const gx = (k % 11) / 10 - 0.5, gy = Math.floor(k / 11) / 3 - 0.5;
    clusters.push({
      x: gx * 9.2 + (Math.random() - 0.5) * 1.2,
      y: gy * 5.2 + (Math.random() - 0.5) * 1.1,
      z: (Math.random() - 0.5) * 2.5,
      s: 0.12 + Math.pow(Math.random(), 2.2) * 0.42,
      w: 0.4 + Math.pow(Math.random(), 1.6) * 2.2,
    });
  }
  // three of them are ours
  const oursIdx = new Set();
  while (oursIdx.size < 3) oursIdx.add(Math.floor(Math.random() * K));
  const totalW = clusters.reduce((s, c) => s + c.w, 0);
  let i = 0;
  clusters.forEach((c, k) => {
    const n = k === K - 1 ? count - i : Math.round((c.w / totalW) * count);
    for (let j = 0; j < n && i < count; j++, i++) {
      Cc[i * 3] = c.x + gauss() * c.s;
      Cc[i * 3 + 1] = c.y + gauss() * c.s * 0.85;
      Cc[i * 3 + 2] = c.z + gauss() * c.s * 0.6;
      ours[i] = oursIdx.has(k) ? 1 : 0;
    }
  });
  for (let j = 0; j < count; j++) seed[j] = Math.random();
  // shuffle-free: attribute order doesn't matter for points.

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(A, 3)); // unused but required
  geo.setAttribute("aA", new THREE.BufferAttribute(A, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  geo.setAttribute("aC", new THREE.BufferAttribute(Cc, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aOurs", new THREE.BufferAttribute(ours, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixelRatio: { value: pr },
      uSize: { value: 2.6 },
      uSpread: { value: new THREE.Vector2(1, 1) },
      uPulse: { value: 0 },
      uAlpha: { value: 0.85 },
      uInk: { value: new THREE.Color(ink) },
      uSeal: { value: new THREE.Color(seal) },
    },
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── state ──
  const state = { target: 0, progress: 0, pulse: 0, pulseTarget: 0, px: 0, py: 0, tx: 0, ty: 0, running: false, raf: 0, w: 1, h: 1 };
  const clock = new THREE.Timer();

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    if (w === state.w && h === state.h) return;
    state.w = w; state.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // fit the mass (r≈1.6) inside the narrower dimension
    const halfFov = (camera.fov * Math.PI) / 360;
    const portrait = camera.aspect < 0.9;
    const fit = portrait ? 2.7 : 3.2;
    camera.position.z = fit / (Math.tan(halfFov) * Math.min(1, camera.aspect));
    // portrait: lift the mass so the headline sits beneath it
    points.position.y = portrait ? 1.15 : 0.7;
    camera.updateProjectionMatrix();
    // portrait screens: squeeze the constellation horizontally, stretch vertically
    const a = camera.aspect;
    mat.uniforms.uSpread.value.set(Math.min(1, a / 1.55) * 0.95 + 0.05, a < 1 ? Math.min(1.9, 1 / a) : 1);
    mat.uniforms.uSize.value = w < 700 ? 2.3 : 2.6;
    mat.uniforms.uAlpha.value = w < 700 ? 0.95 : 0.85;
  }

  function frame() {
    if (!state.running) return;
    state.raf = requestAnimationFrame(frame);
    resize();
    clock.update(); const t = clock.getElapsed();
    state.progress += (state.target - state.progress) * 0.07;
    state.pulse += (state.pulseTarget - state.pulse) * 0.05;
    state.px += (state.tx - state.px) * 0.05;
    state.py += (state.ty - state.py) * 0.05;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uProgress.value = state.progress;
    mat.uniforms.uPulse.value = state.pulse;
    points.rotation.y = state.px * 0.25;
    points.rotation.x = state.py * 0.15;
    renderer.render(scene, camera);
  }

  return {
    setProgress(v) { state.target = v; },
    setPulse(v) { state.pulseTarget = v; },
    setPointer(x, y) { state.tx = x; state.ty = y; },
    start() { if (!state.running) { state.running = true; frame(); } },
    stop() { state.running = false; cancelAnimationFrame(state.raf); },
    dispose() { this.stop(); geo.dispose(); mat.dispose(); renderer.dispose(); },
  };
}
