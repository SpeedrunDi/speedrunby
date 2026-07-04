// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://speedrunby.pages.dev',
  output: 'static',
  compressHTML: true,
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ru',
        locales: { ru: 'ru-RU', en: 'en-US' },
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
    assets: 'assets',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // the strict CSP (script-src 'self') forbids inline scripts —
      // never let tiny chunks get inlined into the HTML
      assetsInlineLimit: 0,
    },
  },
});
