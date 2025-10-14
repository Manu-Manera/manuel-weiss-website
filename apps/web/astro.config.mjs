import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      include: ['**/components/*.{js,jsx,ts,tsx}']
    }),
    tailwind({
      applyBaseStyles: false
    }),
    sitemap({
      filter: (page) => !page.includes('admin') && !page.includes('api')
    })
  ],
  output: 'static',
  site: 'https://mawps.netlify.app',
  base: '/',
  build: {
    assets: 'assets'
  },
  vite: {
    define: {
      'process.env': process.env
    }
  },
  experimental: {
    contentCollectionCache: true
  }
});
