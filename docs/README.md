# Website Documentation

Documentation for [yungsamd17.github.io](https://yungsamd17.github.io) - Sam's personal website.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Content Editing](#content-editing)
- [Design System](#design-system)
- [Theme System](#theme-system)
- [Translation System](#translation-system)
- [Adding a New Language](#adding-a-new-language)
- [Easter Eggs](#easter-eggs)
- [Deployment](#deployment)
- [Commit Message Types](#commit-message-types)

---

## Tech Stack

| Tool | What it does |
|------|--------------|
| [Astro 5](https://astro.build) | Static site framework — zero JS by default |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling with `@theme` tokens |
| [TypeScript](https://www.typescript.com) | Strict typing across data, i18n and scripts |
| [@fontsource-variable](https://fontsource.org/fonts/inter) | Self-hosted Inter & JetBrains Mono |
| [GitHub Actions](https://github.com/features/actions) | Build & deploy on every push |

---

## Project Structure

```
yungsamd17.github.io/
├── astro.config.mjs         # Astro config (site URL, sitemap, Tailwind)
├── package.json
├── tsconfig.json
├── public/                  # Static files served as-is
│   ├── favicon.ico
│   ├── logo.jpg
│   ├── robots.txt
│   ├── src/assets/          # Legacy asset path (kept for old links)
│   └── downloader/          # BetterDiscord downloader tool (vanilla JS)
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── BaseHead.astro   # SEO meta, OG tags, no-FOUC theme/lang script
│   │   ├── Header.astro     # Floating glass pill navigation
│   │   ├── Footer.astro
│   │   ├── Icon.astro       # Inline SVG icon set (no icon CDN)
│   │   ├── LangSelect.astro
│   │   ├── ThemeToggle.astro
│   │   └── ProjectCard.astro
│   ├── data/
│   │   └── site.ts          # All content: socials, featured, projects, links
│   ├── i18n/
│   │   └── ui.ts            # UI strings (en / sk)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro      # Home
│   │   ├── projects.astro
│   │   ├── about.astro
│   │   ├── links.astro      # Link-in-bio page
│   │   ├── secret.astro     # 🎉
│   │   └── 404.astro
│   ├── scripts/
│   │   └── app.ts           # Client JS: theme, lang, age, easter eggs
│   └── styles/
│       └── global.css       # Design tokens, aurora backdrop, motion
├── docs/                    # This documentation
└── .github/
    ├── FUNDING.yml
    └── workflows/deploy.yml # Build & deploy to GitHub Pages
```

---

## Development

```bash
npm install        # install dependencies
npm run dev        # dev server at localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## Content Editing

Almost all content lives in **`src/data/site.ts`**:

- `SITE` — name, handle, email, birth date
- `SOCIALS` — home page social icons
- `FEATURED` — featured project cards on home
- `PROJECTS` — cards on `/projects`
- `LINKS` — rows on `/links`

UI labels live in **`src/i18n/ui.ts`**. Edit, save, and the dev server hot-reloads.

---

## Design System

Tokens are defined once in `src/styles/global.css` and mapped into Tailwind via `@theme inline`:

| Token | Purpose |
|-------|---------|
| `--bg`, `--raised` | Page & surface backgrounds |
| `--hi`, `--mid`, `--low` | Text hierarchy |
| `--accent` | Brand coral (oklch) |
| `--glass`, `--glass-line` | Glass card surfaces |
| `--glow-a/b/c` | Aurora backdrop blobs |

Use them as utilities: `text-mid`, `bg-accent-soft`, `border-line`, `font-mono`, etc.
Components: `.card-glass`, `.pill`, `.micro-label`, `.link-underline`, `.reveal`.

---

## Theme System

Three modes: **system → light → dark** (cycled by the header button).

1. **No-FOUC:** an inline script in `BaseHead.astro` applies the saved mode before first paint
2. **CSS:** tokens flip under `[data-theme="light"]`; dark is the default
3. **Persistence:** `localStorage['theme']`
4. **Live sync:** switching OS theme while in *system* mode updates instantly

---

## Translation System

Fully static bilingual rendering — **both languages are in the HTML**, one is hidden by CSS:

```html
<span data-lang="en">building tools for the web</span>
<span data-lang="sk">tvorím nástroje pre web</span>
```

```css
:root[lang="sk"] [data-lang="en"] { display: none !important; }
```

Switching language only sets `<html lang>` + `localStorage['lang']` — zero content swapping, works without JS after first choice.

---

## Adding a New Language

Example: French (`fr`).

1. **`src/i18n/ui.ts`** — add a `fr` object with all keys from `en`
2. **`src/data/site.ts`** — extend `Locale` type and add `fr` text to every `desc`
3. **`src/styles/global.css`** — add hide rules:
   ```css
   :root[lang="fr"] [data-lang="en"],
   :root[lang="en"] [data-lang="fr"],
   :root[lang="sk"] [data-lang="fr"],
   :root[lang="fr"] [data-lang="sk"] { display: none !important; }
   ```
4. **`src/components/LangSelect.astro`** — add `<option value="fr">Français</option>`
5. **`src/scripts/app.ts`** — extend the lang checks (`=== 'sk' ? 'sk' : 'en'`) to include `fr`
6. Rich-text pages (`about.astro`, `secret.astro`, `404.astro`) — duplicate marked blocks with `data-lang="fr"`

---

## Easter Eggs

All preserved from v1:

1. **Tagline click** — "building tools" ↔ "building bugs" for 2s (`app.ts`)
2. **Console art** — open DevTools and say hi
3. **`?debug=true`** — green debug border
4. **Secret page** — click the year in the footer, or visit `/secret/`

---

## Deployment

Automatic via **`.github/workflows/deploy.yml`** (official `withastro/action`):

1. Push to `main` → site builds and deploys
2. One-time setup: repo **Settings → Pages → Source → GitHub Actions**

Sitemap is generated at `/sitemap-index.xml` by `@astrojs/sitemap`.

---

## Commit Message Types

Recommended commit message format for this project:

### Types:
- **feat** - New features (easter eggs, new pages, etc.)
- **fix** - Bug fixes (typos, broken functionality)
- **style** - UI/UX changes (CSS updates, layout changes)
- **refactor** - Code cleanup without changing functionality
- **docs** - Documentation updates (README, comments)
- **perf** - Performance improvements
- **chore** - Maintenance (updating deps, configs)

### Examples:
```
feat: add rainbow theme easter egg
fix: correct translation typo in Slovak about text
style: update project card hover effects
refactor: remove unused rainbow theme code
docs: add documentation for language system
chore: bump astro to latest
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Last updated:** August 2026
