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

test('contribution graph revalidates data and dims tomorrow', () => {
  const app = read('src/scripts/app.ts');
  const lib = read('src/lib/contributions.ts');
  const css = read('src/styles/global.css');

  // the API response must never be served from an HTTP cache
  assert.ok(lib.includes("cache: 'no-store'"));
  // no localStorage TTL may skip the refresh
  assert.ok(!app.includes('CONTRIB_CACHE_TTL'));
  assert.ok(app.includes('void refreshContributions(grid, key, sig);'));
  // tomorrow is a future day like any other
  assert.ok(!app.includes('trailingIndex'));
  assert.ok(app.includes('cutoff.setDate(cutoff.getDate() + 1);'));
  assert.ok(!css.includes('tomorrow stays bright'));
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
