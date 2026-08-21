import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://yungsamd17.github.io',
  trailingSlash: 'ignore',
  compressHTML: false,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
