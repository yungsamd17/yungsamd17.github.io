import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

function localeKeys(source, locale) {
  const marker = `${locale}: {`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${locale} object missing`);
  const rest = source.slice(start + marker.length);
  const end = rest.indexOf('\n  },');
  assert.notEqual(end, -1, `${locale} object not closed`);
  return new Set([...rest.slice(0, end).matchAll(/^    ([A-Za-z0-9_]+):/gm)].map((m) => m[1]));
}

test('English and Slovak UI keys stay paired', () => {
  const ui = read('src/i18n/ui.ts');
  const en = localeKeys(ui, 'en');
  const sk = localeKeys(ui, 'sk');
  assert.ok(en.size > 0);
  assert.deepEqual([...en].sort(), [...sk].sort());
});

test('layout is redesign-only with no old gating or easter-egg leftovers', () => {
  const files = [
    'src/layouts/BaseLayout.astro',
    'src/styles/global.css',
    'src/scripts/app.ts',
    'src/pages/projects.astro',
    'docs/README.md',
  ].map(read).join('\n');
  for (const leftover of ['data-redesign="on"', 'html[data-redesign]', 'html:not([data-redesign])', 'KONAMI', 'rainbow-hue', 'data-rd-only']) {
    assert.ok(!files.includes(leftover), `stale code found: ${leftover}`);
  }
});

test('no unused icons', () => {
  const icons = read('src/icons.ts');
  const defined = new Set([...icons.matchAll(/^\s*'?([\w-]+)'?:\s*'(?:M|circle)/gm)].map((m) => m[1]));
  const source = ['src/pages', 'src/components', 'src/data', 'src/scripts']
    .flatMap((dir) => {
      return readdirSync(join(root, dir)).filter((f) => /\.(astro|ts)$/.test(f)).map((f) => read(`${dir}/${f}`));
    })
    .join('\n');
  const used = new Set([
    ...[...source.matchAll(/<Icon\s+name=["']([^"']+)["']/g)].map((m) => m[1]),
    ...[...source.matchAll(/\bicon:\s*'([\w-]+)'/g)].map((m) => m[1]),
  ]);
  assert.deepEqual([...defined].filter((name) => !used.has(name)), []);
});

test('past projects are the three no-longer-maintained ones', () => {
  const projects = read('src/pages/projects.astro');
  for (const title of ['Volume Control', 'BetterDiscord Addons', 'NoPixel Vehicle Mods']) {
    assert.ok(projects.includes(`'${title}'`), `missing past project: ${title}`);
  }
  assert.ok(projects.includes('nowProjects') && projects.includes('pastProjects'));
  assert.ok(projects.includes('aria-labelledby="proj-now-heading"'));
  assert.ok(projects.includes('aria-labelledby="proj-past-heading"'));
});

test('snack bar is shown by default', () => {
  const head = read('src/components/BaseHead.astro');
  const app = read('src/scripts/app.ts');
  const docs = read('docs/README.md');

  // only an explicit opt-out sets the hiding attribute before first paint
  assert.ok(head.includes("localStorage.getItem('toast') === 'off'"));
  assert.ok(app.includes("getStorage('toast') === 'off'"));
  assert.ok(docs.includes('**off** (toasts shown'));
});

test('contribution graph revalidates data, dims tomorrow and hides later days', () => {
  const app = read('src/scripts/app.ts');
  const lib = read('src/lib/contributions.ts');
  const css = read('src/styles/global.css');

  // the API response must never be served from an HTTP cache
  assert.ok(lib.includes("cache: 'no-store'"));
  // no localStorage TTL may skip the refresh
  assert.ok(!app.includes('CONTRIB_CACHE_TTL'));
  assert.ok(app.includes('void refreshContributions(grid, key, sig);'));
  assert.ok(app.includes("cell.toggleAttribute('data-tomorrow', date?.getTime() === tomorrow.getTime())"));
  assert.ok(app.includes("cell.toggleAttribute('data-after-tomorrow', date !== undefined && date > tomorrow)"));
  assert.match(css, /\.rd-contrib-cell\[data-tomorrow\]\s*\{\s*opacity: \.25;/);
  assert.match(css, /\.rd-contrib-cell\[data-tomorrow\]\s*\{\s*pointer-events: none;/);
  assert.match(css, /\.rd-contrib-cell\[data-after-tomorrow\]\s*\{\s*visibility: hidden;\s*pointer-events: none;/);
  assert.ok(app.includes('.rd-contrib-cell:not([data-empty], [data-tomorrow], [data-after-tomorrow])'));
  assert.match(css, /@media \(pointer: coarse\)\s*\{[^}]*\.rd-contrib-cell\[data-date\]:not\(\[data-tomorrow\], \[data-after-tomorrow\]\)::after\s*\{[^}]*inset: calc\(var\(--gap\) \/ -2\);/);
});

test('user-facing copy avoids em dashes', () => {
  for (const path of ['src/data/site.ts', 'src/data/history.ts', 'src/i18n/ui.ts']) {
    assert.ok(!/[—–]/.test(read(path)), `dash found in ${path}`);
  }
});

test('above-the-fold icons are not lazy loaded', () => {
  for (const path of ['src/pages/index.astro', 'src/components/ProjectCard.astro', 'src/components/WebsiteHistory.astro']) {
    assert.ok(!read(path).includes('loading="lazy"'), `lazy above-the-fold image in ${path}`);
  }
});

test('history editions stay in sync with their shipped snapshots', () => {
  const data = read('src/data/history.ts');
  const component = read('src/components/WebsiteHistory.astro');
  const slugs = [...data.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]);

  assert.equal(slugs.length, 4);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) {
    assert.ok(existsSync(join(root, 'public/assets/history', `${slug}.webp`)), `missing snapshot: ${slug}`);
  }
  assert.ok(data.includes('alt: LocalizedText'), 'editions need localized alt text');
  assert.equal((data.match(/light: true/g) ?? []).length, 2, 'two editions need light previews');
  for (const slug of ['minimal-site', 'card-redesign']) {
    assert.ok(existsSync(join(root, 'public/assets/history', `${slug}-light.webp`)), `missing light snapshot: ${slug}`);
  }
  assert.ok(component.includes('data-theme'), 'previews must follow the active theme');
  assert.ok(component.includes('replaceState'), 'edition changes must replace history');
  assert.ok(!component.includes('pushState') && !component.includes('popstate'));
});

test('build artifacts (when dist exists)', { skip: !existsSync(join(root, 'dist/index.html')) }, () => {
  const dist = (path) => readFileSync(join(root, 'dist', path), 'utf8');
  assert.equal(dist('404.html'), dist('404/index.html'));
  for (const name of ['index', 'links', 'projects']) {
    assert.ok(existsSync(join(root, `dist/og/${name}.png`)), `missing OG card: ${name}`);
  }
  const sitemap = dist('sitemap-0.xml');
  assert.ok(!sitemap.includes('/extras/'), 'extras must stay out of the sitemap');
  assert.ok(!dist('index.html').includes('data-redesign'));
});
