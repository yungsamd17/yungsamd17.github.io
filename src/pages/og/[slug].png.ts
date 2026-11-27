import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { openSync, type Font } from 'fontkit';
import sharp from 'sharp';
import { SITE } from '../../data/site';
import { UI } from '../../i18n/ui';

interface OgPage {
  slug: string;
  title: string;
  subtitle: string;
  crumb?: string;
}

// Keep the card copy on the same strings the pages use, so it stays in sync
// with the site instead of drifting into a second set of hardcoded titles.
const PAGES: OgPage[] = [
  { slug: 'index', title: SITE.name, subtitle: UI.en.tagline },
  { slug: 'projects', title: UI.en.projectsTitle, subtitle: 'browser extensions, userscripts, and web tools', crumb: UI.en.crumbProjects },
  { slug: 'links', title: UI.en.linksTitle, subtitle: UI.en.linksMeta, crumb: UI.en.crumbLinks },
];

export const getStaticPaths = () => PAGES.map(({ slug }) => ({ params: { slug } }));

const hostname = new URL(SITE.url).hostname;
const avatarPath = new URL('../../../public/assets/icon-512.png', import.meta.url);
const fontPath = import.meta.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
const inter = openSync(fileURLToPath(fontPath));
if (!('getVariation' in inter)) throw new Error('Expected a single Inter variable font');

const titleFont = inter.getVariation({ wght: 700 });
const currentCrumbFont = inter.getVariation({ wght: 600 });
const parentCrumbFont = inter.getVariation({ wght: 500 });
const labelFont = inter.getVariation({ wght: 400 });
const subtitleFont = inter.getVariation({ wght: 300 });

// Match the site's dark theme in global.css.
const colors = { background: '#0e0e10', primary: '#e8e8ec', label: '#a0a0a8', secondary: '#808088' };

function textWidth(font: Font, text: string, size: number) {
  return font.layout(text).advanceWidth * size / font.unitsPerEm;
}

// Render the bundled Inter glyphs as paths so the build never depends on system fonts.
function renderText(font: Font, text: string, x: number, y: number, size: number, fill: string, align: 'left' | 'right' = 'left') {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  const left = align === 'right' ? x - run.advanceWidth * scale : x;
  let advance = 0;
  const glyphs = run.glyphs.map((glyph, i) => {
    const { xAdvance, xOffset, yOffset } = run.positions[i];
    const path = `<path d="${glyph.path.toSVG()}" transform="translate(${advance + xOffset} ${yOffset})"/>`;
    advance += xAdvance;
    return path;
  });
  return `<g fill="${fill}" transform="translate(${left} ${y}) scale(${scale} ${-scale})">${glyphs.join('')}</g>`;
}

function renderBreadcrumb(crumb?: string) {
  const x = 52;
  const y = 68;
  const size = 27;
  const gap = 12;
  if (!crumb) return renderText(currentCrumbFont, SITE.handle, x, y, size, colors.primary);

  const separatorX = x + textWidth(parentCrumbFont, SITE.handle, size) + gap;
  const currentX = separatorX + textWidth(labelFont, '/', size) + gap;
  return `${renderText(parentCrumbFont, SITE.handle, x, y, size, colors.secondary)}
  <g opacity="0.55">${renderText(labelFont, '/', separatorX, y, size, colors.secondary)}</g>
  ${renderText(currentCrumbFont, crumb, currentX, y, size, colors.primary)}`;
}

function wrapSubtitle(text: string, size: number, width: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(subtitleFont, next, size) > width) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  return [...lines, line];
}

function renderSvg({ title, subtitle, crumb }: OgPage, avatar: string): string {
  const subtitleSize = 40;
  const lines = wrapSubtitle(subtitle, subtitleSize, 642);
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${colors.background}"/>
  <image x="54" y="138" width="386" height="386" href="data:image/png;base64,${avatar}"/>
  ${renderBreadcrumb(crumb)}
  ${renderText(labelFont, hostname, 1148, 68, 27, colors.label, 'right')}
  ${renderText(titleFont, title, 500, 356, 132, colors.primary)}
  ${lines.map((line, index) => renderText(subtitleFont, line, 506, 418 + index * 48, subtitleSize, colors.secondary)).join('')}
</svg>`;
}

export const GET: APIRoute = async ({ params }) => {
  const page = PAGES.find((p) => p.slug === params.slug);
  if (!page) return new Response('Not found', { status: 404 });
  const avatar = await readFile(avatarPath, 'base64');
  const png = await sharp(Buffer.from(renderSvg(page, avatar))).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
