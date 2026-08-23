import type { APIRoute } from 'astro';
import sharp from 'sharp';

interface OgPage {
  slug: string;
  title: string;
  subtitle?: string;
}

const PAGES: OgPage[] = [
  { slug: 'index', title: 'Sam @yungsamd17', subtitle: 'building tools for the web' },
  { slug: 'about', title: 'About me', subtitle: 'self-taught web developer from Slovakia' },
  { slug: 'projects', title: 'Other projects', subtitle: 'browser extensions, userscripts, and web tools' },
  { slug: 'links', title: 'Links', subtitle: 'all socials and profiles in one place' },
];

export const getStaticPaths = () => PAGES.map(({ slug }) => ({ params: { slug } }));

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderSvg({ title, subtitle }: OgPage): string {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="90%">
      <stop offset="0%" stop-color="#ff8a80" stop-opacity="0.14"/>
      <stop offset="65%" stop-color="#ff8a80" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0e0e10"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="1.5" y="1.5" width="1197" height="627" rx="24" fill="none" stroke="#32323a" stroke-width="3"/>
  <rect x="96" y="136" width="10" height="150" rx="5" fill="#ff8a80"/>
  <text x="134" y="172" font-family="DejaVu Sans, Segoe UI, sans-serif" font-size="38" fill="#a0a0a8">@yungsamd17</text>
  <text x="132" y="282" font-family="DejaVu Sans, Segoe UI, sans-serif" font-size="88" font-weight="bold" fill="#e8e8ec">${esc(title)}</text>
  ${subtitle ? `<text x="136" y="352" font-family="DejaVu Sans, Segoe UI, sans-serif" font-size="33" fill="#6a6a72">${esc(subtitle)}</text>` : ''}
  <text x="1104" y="556" text-anchor="end" font-family="DejaVu Sans, Segoe UI, sans-serif" font-size="26" fill="#6a6a72">yungsamd17.github.io</text>
</svg>`;
}

export const GET: APIRoute = async ({ params }) => {
  const page = PAGES.find((p) => p.slug === params.slug);
  if (!page) return new Response('Not found', { status: 404 });
  const png = await sharp(Buffer.from(renderSvg(page))).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
