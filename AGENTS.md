# AGENTS.md

Guidance for AI coding agents (OpenCode, Claude Code, etc.) working on this repository.
This is a **single-developer project**: Sam (@yungsamd17) is the only contributor.
Everything here is optimized for speed of iteration, not team process.

## Project Overview

Personal website of yungsamd17 — homepage, about, projects, links, and an OG-image endpoint,
built with Astro 7 + Tailwind CSS v4 (via Vite plugin) + TypeScript. Deployed to GitHub Pages.

- Site URL: https://yungsamd17.github.io
- Stack: Astro 7, Tailwind v4, sharp (icon generation), Node >= 22
- Author/maintainer: yungsamd17 (https://github.com/yungsamd17)

## Workflow (solo mode)

- **Direct commits/pushes to `main` are the default.** There is no branch protection and no CI gate;
  use whatever fits the change.
- Pull requests are **optional**. Use one only for risky or multi-step work you want to review
  before landing. When you do open a PR:
  - Title: `type(scope): short imperative summary` (same format as commits).
  - End the body with an AI attribution line:

    ```
    Built with {model} in the {agent} harness.
    ```

    Example: `Built with ox-alpha in the OpenCode harness.`

- Commit messages: `type(scope): short imperative summary`, lowercase after type, no trailing period.
  Scopes used here: `site`, `pages`, `i18n`, `icons`, `downloader`, `ci`, `docs`.

  ```
  feat(pages): add projects page
  fix(i18n): correct Slovak translation of footer text
  chore(ci): bump astro to 7.2.4
  docs(readme): document local development
  ```

- Never commit `node_modules/`, `dist/`, or secrets.

## Build & Verify

```bash
npm install          # install deps (Node >= 22)
npm run dev          # dev server at localhost:4321
npm run build        # production build (prebuild regenerates icons via sharp)
npm run preview      # serve the dist/ build locally
```

There is no lint/test setup — verify changes visually with `dev`/`preview`.
`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

## Architecture

```
astro.config.mjs         # site config: sitemap (excludes /secret/), Tailwind vite plugin
src/
  data/site.ts           # central site config: identity, socials, Locale type (en | sk)
  i18n/ui.ts             # UI translations — en/sk keys must stay paired
  layouts/BaseLayout.astro
  components/            # BaseHead, Footer, Icon, LangToggle, ThemeToggle
  pages/                 # index, about, projects, links, 404, secret, og/
  scripts/app.ts         # client-side JS (theme toggle etc.)
  styles/                # global styles
scripts/generate-icons.mjs  # prebuild: generates favicon/PWA icons from public/logo.jpg
public/downloader/          # standalone vanilla-JS downloader page (no framework)
```

Key patterns:

- All site identity/config lives in `src/data/site.ts`; edit there, not hardcoded in pages.
- User-visible strings live in `src/i18n/ui.ts` keyed by locale (`en`, `sk`) — when adding a key,
  always add both locales.
- Icons are generated artifacts (`public/icon-*.png`) from `public/logo.jpg` during prebuild —
  edit the source logo, not the generated PNGs.

## Gotchas

- **Every push to `main` deploys live within ~a minute** — double-check before pushing.
- `/secret/` is excluded from the sitemap but is still publicly reachable if someone knows the URL.
- `compressHTML: false` and `trailingSlash: 'ignore'` in astro.config.mjs are intentional — don't "fix".
- `public/downloader/` is deliberately framework-free vanilla JS; keep it that way.
