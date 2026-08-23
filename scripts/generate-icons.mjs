import sharp from 'sharp';

const SOURCE = 'public/logo.jpg';
const BRAND_BG = '#0e0e10';

await sharp(SOURCE).resize(512, 512).png().toFile('public/icon-512.png');
await sharp(SOURCE).resize(180, 180).png().toFile('public/apple-touch-icon.png');

// Maskable variant: logo scaled into the ~80% safe zone on the brand background
const inner = await sharp(SOURCE)
  .resize(Math.round(512 * 0.78), Math.round(512 * 0.78))
  .png()
  .toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: BRAND_BG } })
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile('public/icon-maskable.png');

console.log('icons generated from', SOURCE);
