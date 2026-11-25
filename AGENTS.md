# AGENTS.md

Sam (@yungsamd17) maintains [this personal site](https://yungsamd17.github.io) with Astro 7, Tailwind CSS v4 and TypeScript. Start with the [full website documentation](docs/README.md) for architecture, content, theme, translations and deployment.

## Work locally

- Use Node.js 22 or newer. Run `npm install`, then `npm run dev` (port 4321).
- Run `npm test` for regression checks. Run `npm run build` first when you need to verify generated output, since those checks require `dist/`. Use `npm run preview` to inspect the production build.
- Prefer local builds and tests to conserve GitHub Actions minutes. Every push to `main` triggers a live GitHub Pages deployment via `.github/workflows/deploy.yml`.

## Site conventions

- `src/pages/` serves the homepage, projects, links, extras, the custom 404 and generated OG images. The homepage includes a GitHub contribution calendar, and the projects page shows GitHub star counts.
- Keep site identity and shared content in `src/data/site.ts`. Keep UI strings in `src/i18n/ui.ts` and add matching English and Slovak keys.
- `BaseLayout.astro` renders the shared toolbar and footer. The toolbar holds the theme and language controls, with client-side behavior in `src/scripts/app.ts`.
- Edit `public/logo.jpg` to update generated icons. The prebuild script regenerates them with sharp. Postbuild publishes the clean `/404/` route alongside GitHub Pages' root `404.html`.
- Keep the downloader in `public/downloader/` framework-free. `/extras/` is publicly reachable and excluded from the sitemap. Preserve `compressHTML: false` and `trailingSlash: 'ignore'` in `astro.config.mjs`.

## Git workflow

- Direct commits to `main` are the default. Use a PR when a risky or multi-step change needs review.
- Use `type(scope): short imperative summary` for commits and PR titles. Keep the summary lowercase with no trailing period. Common scopes are `site`, `pages`, `i18n`, `icons`, `downloader`, `ci` and `docs`.
- End PR bodies with `Built with <model> in the <agent> harness.` using the actual model and harness names. Omit AI attribution and self co-author or self sign-off trailers from commits. Credit other human co-authors only when asked.
- Keep `node_modules/`, `dist/` and secrets out of commits.
