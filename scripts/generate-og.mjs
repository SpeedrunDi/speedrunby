// Generates per-locale OG cards (1200x630) into public/og/.
// Runs as `prebuild`, so the build can never reference a missing image.
// Uses generic sans in SVG (librsvg has no access to the site's webfonts);
// visual refinement lands in Phase 7 (media-polish).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const W = 1200;
const H = 630;

const LOCALES = {
  ru: {
    file: 'public/og/og-ru.png',
    eyebrow: 'VERIFIED BY ANTHROPIC',
    name1: 'Amankeldi',
    name2: 'Kydyraliev',
    sub: 'Claude Certified Architect и fullstack-инженер',
    url: 'speedrunby.pages.dev',
  },
  en: {
    file: 'public/og/og-en.png',
    eyebrow: 'VERIFIED BY ANTHROPIC',
    name1: 'Amankeldi',
    name2: 'Kydyraliev',
    sub: 'Claude Certified Architect & Fullstack Engineer',
    url: 'speedrunby.pages.dev',
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function svg({ eyebrow, name1, name2, sub, url }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#161311"/>
  <!-- constellation motif, upper right -->
  <g stroke="#e0855c" stroke-opacity="0.35" stroke-width="2" fill="none">
    <path d="M860 150 L1010 90"/>
    <path d="M1010 90 L1090 210"/>
    <path d="M860 150 L1090 210"/>
    <path d="M1010 90 L1130 60"/>
  </g>
  <circle cx="860" cy="150" r="10" fill="#e0855c" fill-opacity="0.9"/>
  <circle cx="1010" cy="90" r="14" fill="#f0a077"/>
  <circle cx="1090" cy="210" r="8" fill="#e0855c" fill-opacity="0.7"/>
  <circle cx="1130" cy="60" r="6" fill="#e0855c" fill-opacity="0.5"/>

  <g font-family="DejaVu Sans, Arial, sans-serif">
    <text x="96" y="180" fill="#e0855c" font-size="26" letter-spacing="8" font-weight="600">${esc(eyebrow)}</text>
    <text x="92" y="300" fill="#f3ede4" font-size="104" font-weight="800">${esc(name1)}</text>
    <text x="92" y="408" fill="#e0855c" font-size="104" font-weight="800">${esc(name2)}</text>
    <text x="96" y="486" fill="#bcb2a3" font-size="38">${esc(sub)}</text>
    <text x="96" y="560" fill="#8a8072" font-size="30" font-family="DejaVu Sans Mono, monospace">${esc(url)}</text>
  </g>
  <rect x="0" y="622" width="${W}" height="8" fill="#e0855c"/>
</svg>`;
}

mkdirSync('public/og', { recursive: true });
for (const cfg of Object.values(LOCALES)) {
  await sharp(Buffer.from(svg(cfg)))
    .png()
    .toFile(cfg.file);
  console.log('og:', cfg.file);
}
