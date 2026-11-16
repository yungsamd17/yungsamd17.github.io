// GitHub Pages only serves a custom 404 from a root-level 404.html, so that
// file has to stay. This copy also publishes the same page at /404/ so the
// clean URL works (locally and when opening it directly) instead of /404.html.
import { copyFile, mkdir } from 'node:fs/promises';

const source = 'dist/404.html';
const targetDir = 'dist/404';

try {
  await mkdir(targetDir, { recursive: true });
  await copyFile(source, `${targetDir}/index.html`);
  console.log('[404] published /404/ from 404.html');
} catch (error) {
  // A build without the 404 page is not worth failing over.
  console.warn(`[404] skipped: ${error.message}`);
}
