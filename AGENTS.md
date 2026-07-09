# AGENTS.md — Proyecto Blog Personal

## Project Overview
Astro 4.x personal blog with Tailwind CSS, GSAP animations, i18n (ES/EN), and GitHub Pages deployment.

## Quick Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build (dist/)
npm run preview  # Preview production build
npx tsc --noEmit --skipLibCheck  # Type check
```

## Critical Architecture Notes

### i18n Routing
- Routes are prefixed: `/es/*` and `/en/*`
- Root `/` redirects to `/es` (default locale)
- `getStaticPosts(lang)` filters by `id.startsWith(lang + '/')` AND `data.language === lang`
- **Never** mix posts between language folders

### View Transitions
- Enabled via `<ViewTransitions />` in `BaseLayout.astro`
- GSAP scripts MUST use `astro:page-load` event (NOT just `DOMContentLoaded`)
- Always kill previous tweens before re-creating:
  ```javascript
  ScrollTrigger.getAll().forEach(st => st.kill());
  gsap.killTweensOf('.selector');
  ```

### Theme Toggle (Dark/Light)
- `html.dark` = dark mode, `html.light` = light mode
- localStorage key: `theme`
- `BaseLayout.astro` has `astro:after-swap` listener to restore theme on navigation
- Light mode styles are in `global.css` under `html.light` selectors

### Content Collections
- `posts` collection: requires `language` field (`'es'` or `'en'`)
- Posts go in `src/content/posts/{es,en}/filename.mdx`
- Frontmatter must include `language` to pass schema validation

### Arcade/Games
- Game HTML files go in `public/games/*.html`
- `ArcadeMachine.astro` uses lazy-load iframe (src set on PLAY button click)
- Sandbox: `allow-scripts allow-same-origin allow-popups allow-forms`
- `getStaticPaths` for `/play/[slug]` has games array INLINE (not exported)

## Known Pitfalls

1. **GSAP infinite loops**: Kill tweens on individual elements, not just class selectors
2. **SearchBoard keyboard listener**: Uses `window.__searchKeyHandler` to prevent accumulation
3. **Navbar script**: Wrapped in `if (!window.__navbarInit)` to prevent duplicate listeners
4. **@apply in nested CSS**: Tailwind `@apply` doesn't work in nested selectors under `html.light {}` — use plain CSS properties instead

## File Structure
```
src/
├── components/
│   ├── landing/Hero.astro      # Animated hero with GSAP
│   ├── layout/Navbar.astro     # Floating nav with theme toggle
│   ├── portfolio/              # ArcadeMachine, ArcadeLobby
│   ├── posts/                  # PostCard, FeaturedPosts, Comments
│   └── search/SearchBoard.astro
├── content/
│   ├── config.ts               # Zod schemas for collections
│   └── posts/{es,en}/*.mdx     # Blog posts
├── i18n/ui/{es,en}.json        # UI translations
├── layouts/BaseLayout.astro    # Main layout with ViewTransitions
├── pages/
│   ├── index.astro             # Redirects to /es
│   ├── {es,en}/index.astro     # Home pages
│   ├── {es,en}/blog/           # Blog listing + [slug]
│   ├── {es,en}/portfolio.astro # Arcade lobby
│   ├── {es,en}/play/[slug].astro # Game player
│   └── {es,en}/buscar|search.astro # Search
├── styles/global.css           # Tailwind + light mode overrides
└── utils/{i18n,posts}.ts       # Helpers
```

## Tech Stack
- Astro 4.16+ (static output)
- Tailwind CSS 3.4+ (darkMode: 'class')
- GSAP 3.15+ (ScrollTrigger)
- MDX for content
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (code)

## Deployment (GitHub Pages — Project Site)

- **Repo:** `https://github.com/Abismox/Blog_Astro.git` (Project site, subcarpeta)
- **Live URL:** `https://Abismox.github.io/Blog_Astro/`
- **`site` en astro.config.mjs:** `https://Abismox.github.io`
- **`base` en astro.config.mjs:** `/Blog_Astro` (obligatorio — sin esto las rutas i18n, assets y View Transitions rompen)
- **Workflow:** `.github/workflows/deploy.yml` usa `actions/deploy-pages@v4`

### Setup obligatorio en GitHub (una sola vez)
1. Repo → **Settings → Pages → Build and deployment → Source** → seleccionar **"GitHub Actions"** (no "Deploy from a branch"). Esto habilita el workflow que ya está committeado.
2. Verificar que en **Settings → Actions → General → Workflow permissions** esté "Read and write permissions" (lo necesita `actions/deploy-pages`).

### Flujo de trabajo
```bash
git add .
git commit -m "..."
git push origin main   # dispara el workflow, deploy automático en ~1-2 min
```

### Verificación post-deploy
- Tab **Actions** del repo: el run debe quedar en verde.
- `https://Abismox.github.io/Blog_Astro/` debe redirigir a `/Blog_Astro/es/`.
- Inspeccionar la red: los assets deben servirse desde `/Blog_Astro/_astro/...` (no `/`).
