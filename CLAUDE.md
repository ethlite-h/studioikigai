# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally

No tests, linter, or type-checker are configured.

## Architecture

Single-page React 18 marketing site for Studio Ikigai, built with Vite and deployed on Vercel. Two source files:

- `src/main.jsx` — React entry point. Renders `<App />` and mounts `@vercel/analytics`.
- `src/App.jsx` — The whole site: header, hero, two product cards (Antiviral, Inner Voice), philosophy, principles, footer. Product copy, palette, and animations all live in this one file.

`vercel.json` sets baseline security headers (nosniff, referrer-policy, permissions-policy, frame-options).

### Styling

No CSS framework, no CSS files. All styles are inline JSX `style` objects. Two cross-cutting pieces:

- Color palette is the `C` object at the top of `App.jsx` — edit colors there, not at call sites.
- Global CSS (`@keyframes`, `::selection`, `:focus-visible` rings, `prefers-reduced-motion` override) lives in a single `<style>` tag inside the `App` component. Google Fonts are loaded via `<link>` in `index.html`, not `@import`. Fonts used: Instrument Serif (display), Outfit (body), JetBrains Mono (labels/meta).

### Reveal animations

`useReveal` / `<Reveal>` in `App.jsx` wrap sections to fade/translate them in on scroll via `IntersectionObserver`. Pass `delay` (seconds) to stagger siblings.

### Content

Product details (name, tagline, features, CTA links) are props passed to `<ProductCard />` in `App.jsx`. Principles are an inline array in the same file. There is no CMS — copy changes are code changes.
