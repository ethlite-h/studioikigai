# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (add `-- --host` to open it on the LAN for phone testing)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `STEMS="$HOME/Downloads/She Rises! Stems" node scripts/make-video.mjs` — regenerate `public/media/` from the song's stems: mixes "0 Lead Vocals" + "1 Instrumental" into `she-rises.m4a` (the track the Listen button plays) and renders the spectrogram and waveform videos from the vocal stem alone. `SONG=` renders from a plain mix instead; no env renders from a synthesised melody.
- `scripts/align-lyrics.py` — forced alignment of `scripts/she-rises-lyrics.txt` to the vocal stem with stable-ts (usage in the file header); writes `src/data/she-rises.json` (phrase/word timing plus an estimated MIDI note per word). The lyric sheet omits "She wasn't weak. / She was whole." because that take does not sing them. The BrightStar bundle in the Inner Voice iCloud folder is an older arrangement (2:50) — do not use it. Stems are not in the repo.

No tests, linter, or type-checker are configured.

## Architecture

Single-page React 18 marketing site for Studio Ikigai, built with Vite and deployed on Vercel. The site tells the "Micro Tech" story from the founder's essay (https://ethlite.substack.com/p/software-engineerings-podcast-moment): small teams, on-device AI, products that answer to users rather than investors.

- `src/main.jsx` — entry point. Renders `<App />` and mounts `@vercel/analytics`.
- `src/App.jsx` — section order only. Each section is a component in `src/components/`.
- `src/styles.css` — the only stylesheet: design tokens (`:root`), typography classes, every section's layout, reveal animations, reduced-motion overrides. Components use these classes plus occasional inline styles for one-offs.
- `src/lib/scroll.js` — one shared rAF-throttled scroll subscription (`subscribeScroll`), `usePinProgress` (0→1 progress of a pinned section, written to a ref, no re-render), `useInView`, `reducedMotion()`, `isTouch()`.
- `src/lib/Reveal.jsx` — `<Reveal>` (adds `.is-in` on scroll; CSS animates) and `<Words>` (per-word masked slide-up; pass `mount` for a CSS-keyframe reveal on page load that does not depend on JS timing).
- `src/gl/particles.js` — raw WebGL point cloud, no library (~8 KB). Lazily imported by `Thesis.jsx`. Three shapes are baked as vertex attributes (mass → scatter → clusters) and mixed in the vertex shader by `uProgress` (0→2). The pointer repels points (`setPointer`), a tap gathers a temporary vermilion cluster (`tap`). Exposes `setProgress/setPulse/setPointer/clearPointer/tap/start/stop/dispose`.
- `src/components/Thesis.jsx` — the pinned hero: a 520svh section with a sticky 100svh canvas. Scroll progress drives the particle state and fades four text "steps" in and out by writing styles directly to refs.
- `src/components/Math.jsx` — the interactive users × price × team calculator.
- `src/components/Products.jsx` — product data (copy, features, CTAs) and the alternating chapter layout. Phone mockups live in `src/phones/` (Antiviral: DOM + timers; Inner Voice and Sing!: 2D canvas via `useCanvasLoop`, paused when off-screen).
- `src/components/Founder.jsx` — dark section; toggles `.nav.dark` while it sits under the fixed nav. Real photo (`public/media/helen.webp|jpg`) with a canvas voice-print halo behind it, bio written from the founder's resume (employers named by her choice), and a facts grid.
- `src/lib/player.js` — one shared `<audio>` for "She Rises!" (`public/media/she-rises.m4a`, 2:50, loaded only on press) with a subscribe API. `src/components/Listen.jsx` is the play/pause button; `src/phones/SingPhone.jsx` reads `player.now()` every frame to highlight the current phrase and sung words and to draw target-note bars from `src/data/she-rises.json`. When nothing is playing it silently loops the first chorus (24–37.6 s) so the mock still moves.
- `src/components/Log.jsx` — studio log; `ENTRIES` array, newest first. Only add things that actually happened.
- `src/components/Newsletter.jsx` — email field that hands off to Substack's subscribe page (GET, new tab). No backend, no list of ours.
- `src/components/Seal.jsx` — the vermilion 生き甲斐 hanko used as the logo.
- `public/media/` — generated assets (see script above) plus the founder photo. Videos are muted, looping, `playsInline`, and only play while in view. `public/og.png` is the share card (1200×630), rendered from a static HTML mock with headless Chrome; `robots.txt` and `sitemap.xml` are static. JSON-LD for the organization, founder and apps lives in `index.html`.

### Styling conventions

- Palette and fonts are CSS custom properties at the top of `styles.css` (`--paper`, `--ink`, `--seal`, per-product accents `--moss/--clay/--indigo`). Edit there, not at call sites.
- Fonts: Fraunces (display, variable with `opsz/SOFT/WONK`), Instrument Sans (body), JetBrains Mono (labels). Loaded via `<link>` in `index.html`.
- Mobile first: `svh` units, safe-area insets, 44px+ tap targets, `overflow-x: clip` on body, a `.hero-bottom > *, .grid-2 > * { min-width: 0 }` guard against grid overflow. Anything hover-only must also work on touch.
- `prefers-reduced-motion` disables reveals, the grain overlay, and snaps the particle field between states.

### Dev/verification helpers

- `?shot=1` in the URL skips the intro stamp and disables smooth scrolling; used for headless screenshots. Headless Chrome via the DevTools Protocol (mobile emulation + `scrollTo` + real waits) is the reliable way to verify pinned/scroll-driven states; plain `--screenshot` cannot scroll or run transitions.

### Content

All copy lives in the components (product data in `Products.jsx`, tenets in `Manifesto.jsx`, steps in `Thesis.jsx`, build log in `CaseStudy.jsx`, studio log in `Log.jsx`). The diff counts in the case-study log and the numbers inside the phone mockups are illustrative and labelled "sample data". Product facts (TestFlight status, iOS/macOS, CREPE/HuBERT/Whisper on-device, instrumentals via ElevenLabs/Suno) come from the founder's resume; keep claims consistent with it. Both apps are not yet on the App Store, so there are no store badges.
