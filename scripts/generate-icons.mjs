import sharp from 'sharp';

const SOURCE = 'public/logo.jpg';
const BRAND_BG = '#0e0e10';

// Palette PNGs keep the generated icons small enough for mobile browsers to
// fetch reliably (the truecolor 512px source was ~186 KB).
const png = (input, size, file) =>
  sharp(input)
    .resize(size, size)
    .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
    .toFile(file);

// Round avatar crop: the logo is clipped to a circle with transparent corners,
// so the favicon reads as a circle in tabs and bookmark bars.
const roundAvatar = async (size) => {
  const base = await sharp(SOURCE).resize(size, size).png().toBuffer();
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  );
  return sharp(base)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
};

// Rounded logo on the brand background: iOS and maskable launchers mask their
// own shape, so transparency there would show up as black corners.
const roundOnBackground = async (size, scale = 1) => {
  const inner = await roundAvatar(Math.round(size * scale));
  return sharp({ create: { width: size, height: size, channels: 4, background: BRAND_BG } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toBuffer();
};

// ICO container with PNG payloads (16/32/48), supported by every modern browser.
const toIco = (images) => {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  images.forEach(({ size, data }, i) => {
    const o = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, o);
    header.writeUInt8(size >= 256 ? 0 : size, o + 1);
    header.writeUInt8(0, o + 2);
    header.writeUInt8(0, o + 3);
    header.writeUInt16LE(1, o + 4);
    header.writeUInt16LE(32, o + 6);
    header.writeUInt32LE(data.length, o + 8);
    header.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
};

const { writeFile } = await import('node:fs/promises');

await png(await roundAvatar(32), 32, 'public/favicon-32x32.png');
await png(await roundAvatar(192), 192, 'public/icon-192.png');
await png(await roundAvatar(512), 512, 'public/icon-512.png');

await png(await roundOnBackground(180), 180, 'public/apple-touch-icon.png');

// Maskable variant: logo scaled into the ~80% safe zone on the brand background
await png(await roundOnBackground(512, 0.78), 512, 'public/icon-maskable.png');

const icoImages = [];
for (const size of [16, 32, 48]) {
  const data = await sharp(await roundAvatar(size)).png({ compressionLevel: 9, effort: 10 }).toBuffer();
  icoImages.push({ size, data });
}
await writeFile('public/favicon.ico', toIco(icoImages));

console.log('icons generated from', SOURCE);
