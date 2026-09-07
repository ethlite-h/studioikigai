# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (add `-- --host` to open it on the LAN for phone testing)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `node scripts/make-video.mjs` — regenerate `public/media/*.mp4|jpg` (synthesises a melody in Node, renders it with the `ffmpeg-static` binary; no system ffmpeg needed)

No tests, linter, or type-checker are configured.

## Architecture

Single-page React 18 marketing site for Studio Ikigai, built with Vite and deployed on Vercel. The site tells the "Micro Tech" story from the founder's essay (https://ethlite.substack.com/p/software-engineerings-podcast-moment): small teams, on-device AI, products that answer to users rather than investors.

- `src/main.jsx` — entry point. Renders `<App />` and mounts `@vercel/analytics`.
- `src/App.jsx` — section order only. Each section is a component in `src/components/`.
- `src/styles.css` — the only stylesheet: design tokens (`:root`), typography classes, every section's layout, reveal animations, reduced-motion overrides. Components use these classes plus occasional inline styles for one-offs.
- `src/lib/scroll.js` — one shared rAF-throttled scroll subscription (`subscribeScroll`), `usePinProgress` (0→1 progress of a pinned section, written to a ref, no re-render), `useInView`, `reducedMotion()`, `isTouch()`.
- `src/lib/Reveal.jsx` — `<Reveal>` (adds `.is-in` on scroll; CSS animates) and `<Words>` (per-word masked slide-up; pass `mount` for a CSS-keyframe reveal on page load that does not depend on JS timing).
- `src/three/particles.js` — the Three.js point cloud. Lazily imported by `Thesis.jsx` so Three.js is its own chunk. Three shapes are baked as vertex attributes (mass → scatter → clusters) and mixed in the vertex shader by `uProgress` (0→2). Exposes `setProgress/setPulse/setPointer/start/stop/dispose`.
- `src/components/Thesis.jsx` — the pinned hero: a 520svh section with a sticky 100svh canvas. Scroll progress drives the particle state and fades four text "steps" in and out by writing styles directly to refs.
- `src/components/Math.jsx` — the interactive users × price × team calculator.
- `src/components/Products.jsx` — product data (copy, features, CTAs) and the alternating chapter layout. Phone mockups live in `src/phones/` (Antiviral: DOM + timers; Inner Voice and Sing!: 2D canvas via `useCanvasLoop`, paused when off-screen).
- `src/components/Founder.jsx` — dark section; toggles `.nav.dark` while it sits under the fixed nav. The "portrait" is a canvas voice print reusing `drawVoicePrint` from the Inner Voice phone.
- `src/components/Seal.jsx` — the vermilion 生き甲斐 hanko used as the logo.
- `public/media/` — generated video/poster assets (see script above). Videos are muted, looping, `playsInline`, and only play while in view.

### Styling conventions

- Palette and fonts are CSS custom properties at the top of `styles.css` (`--paper`, `--ink`, `--seal`, per-product accents `--moss/--clay/--indigo`). Edit there, not at call sites.
- Fonts: Fraunces (display, variable with `opsz/SOFT/WONK`), Instrument Sans (body), JetBrains Mono (labels). Loaded via `<link>` in `index.html`.
- Mobile first: `svh` units, safe-area insets, 44px+ tap targets, `overflow-x: clip` on body, a `.hero-bottom > *, .grid-2 > * { min-width: 0 }` guard against grid overflow. Anything hover-only must also work on touch.
- `prefers-reduced-motion` disables reveals, the grain overlay, and snaps the particle field between states.

### Dev/verification helpers

- `?shot=1` in the URL skips the intro stamp and disables smooth scrolling; used for headless screenshots. Headless Chrome via the DevTools Protocol (mobile emulation + `scrollTo` + real waits) is the reliable way to verify pinned/scroll-driven states; plain `--screenshot` cannot scroll or run transitions.

### Content

All copy lives in the components (product data in `Products.jsx`, tenets in `Manifesto.jsx`, steps in `Thesis.jsx`, log in `CaseStudy.jsx`). The diff counts in the case-study log are illustrative texture, not real numbers. Founder is presented as Helen Ma with former employers left unnamed by choice.
