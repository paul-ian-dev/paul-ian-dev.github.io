import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://paul-ian-dev.github.io',
  integrations: [sitemap()],
});
