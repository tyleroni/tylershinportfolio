# Tyler Shin — Portfolio

A retro-modern portfolio built around a CRT TV + Win95 desktop metaphor.

## Stack

- **Vite + React + TypeScript** — fast HMR, strict typing
- **React Router 6** — for routing
- **Zustand** — for the window/tab state (lighter weight than Context)
- **Three.js + @react-three/fiber + @react-three/drei** — 3D icons
- **GSAP** — CRT transition + window open/close animation
- **Motion** (formerly Framer Motion) — UI micro-animations
- **Sass Modules** — scoped per-component styles

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.

## Project structure

```
src/
  config/           Design tokens, bio lines, nav config, case-study metadata
  components/       Reusable components (TvFrame, Desktop, Window, etc.)
  pages/            Page-level components (About, Projects, Contact, Resume)
  state/            Zustand stores
  hooks/            Reusable React hooks
  styles/           Global stylesheets + design tokens
  App.tsx           Top-level component
  main.tsx          React entry point
```

## Deployment (Cloudflare Pages)

1. `npm run build` — outputs to `dist/`
2. Deploy the `dist/` folder to Cloudflare Pages
3. Build command: `npm run build`, output directory: `dist`

## Editing content

- **Bio lines** (the rotating terminal text top-left): `src/config/bio-lines.ts`
- **Case studies metadata**: `src/config/case-studies.ts`
- **Full case study content**: `src/content/case-studies/[slug].mdx` (to be added)
- **Nav icons**: `src/config/nav-icons.ts`
- **Tunable design tokens** (timings, intensities): `src/config/design-tokens.ts`

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a production build
- `npm run preview` — preview the production build locally
- `npm run type-check` — run TypeScript checks without emitting
