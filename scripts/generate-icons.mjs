import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const ASSETS = 'public/assets';
const SOURCE = `${ASSETS}/logo.jpg`;

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

// Each PNG uses the same transparent circular crop as the favicon.
for (const [name, size] of [['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
  const data = await roundAvatar(size);
  await sharp(data)
    .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
    .toFile(`${ASSETS}/${name}.png`);
}

const icoImages = [];
for (const size of [16, 32, 48]) {
  const data = await sharp(await roundAvatar(size)).png({ compressionLevel: 9, effort: 10 }).toBuffer();
  icoImages.push({ size, data });
}
await writeFile(`${ASSETS}/favicon.ico`, toIco(icoImages));

console.log('icons generated from', SOURCE);
