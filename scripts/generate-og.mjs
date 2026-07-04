// Generates per-locale OG cards (1200x630) into public/og/.
// Runs as `prebuild`, so the build can never reference a missing image.
// Composites the portrait cutout when available (_originals is git-ignored;
// CI regenerates the text-only variant, which is why public/og is tracked).
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

const W = 1200;
const H = 630;
const PORTRAIT = '_originals/portrait-cutout.png';

const LOCALES = {
  ru: {
    file: 'public/og/og-ru.png',
    eyebrow: 'VERIFIED BY ANTHROPIC',
    name1: 'Amankeldi',
    name2: 'Kydyraliev',
    sub1: 'Claude Certified Architect',
    sub2: 'и fullstack-инженер',
    url: 'speedrunby.pages.dev',
  },
  en: {
    file: 'public/og/og-en.png',
    eyebrow: 'VERIFIED BY ANTHROPIC',
    name1: 'Amankeldi',
    name2: 'Kydyraliev',
    sub1: 'Claude Certified Architect',
    sub2: '& Fullstack Engineer',
    url: 'speedrunby.pages.dev',
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function svg({ eyebrow, name1, name2, sub1, sub2, url }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#161311"/>
  <!-- warm glow behind the portrait side -->
  <ellipse cx="980" cy="330" rx="420" ry="380" fill="#e0855c" fill-opacity="0.10"/>
  <!-- constellation motif -->
  <g stroke="#e0855c" stroke-opacity="0.4" stroke-width="2" fill="none">
    <path d="M700 120 L830 70"/>
    <path d="M830 70 L900 170"/>
    <path d="M700 120 L900 170"/>
    <path d="M830 70 L950 40"/>
    <path d="M900 170 L1050 140"/>
  </g>
  <circle cx="700" cy="120" r="9" fill="#e0855c" fill-opacity="0.9"/>
  <circle cx="830" cy="70" r="13" fill="#f0a077"/>
  <circle cx="900" cy="170" r="7" fill="#e0855c" fill-opacity="0.7"/>
  <circle cx="950" cy="40" r="5" fill="#e0855c" fill-opacity="0.5"/>
  <circle cx="1050" cy="140" r="6" fill="#e0855c" fill-opacity="0.6"/>

  <g font-family="DejaVu Sans, Arial, sans-serif">
    <text x="96" y="178" fill="#e0855c" font-size="25" letter-spacing="8" font-weight="600">${esc(eyebrow)}</text>
    <text x="92" y="296" fill="#f3ede4" font-size="100" font-weight="800">${esc(name1)}</text>
    <text x="92" y="400" fill="#e0855c" font-size="100" font-weight="800">${esc(name2)}</text>
    <text x="96" y="470" fill="#bcb2a3" font-size="35">${esc(sub1)}</text>
    <text x="96" y="516" fill="#bcb2a3" font-size="35">${esc(sub2)}</text>
    <text x="96" y="576" fill="#93897b" font-size="28" font-family="DejaVu Sans Mono, monospace">${esc(url)}</text>
  </g>
  <rect x="0" y="622" width="${W}" height="8" fill="#e0855c"/>
</svg>`;
}

mkdirSync('public/og', { recursive: true });

let portraitLayer = null;
if (existsSync(PORTRAIT)) {
  // right-aligned, bottom-anchored portrait
  portraitLayer = await sharp(PORTRAIT).resize({ height: 560 }).png().toBuffer();
}

for (const cfg of Object.values(LOCALES)) {
  const base = sharp(Buffer.from(svg(cfg))).png();
  if (portraitLayer) {
    const meta = await sharp(portraitLayer).metadata();
    await base
      .composite([{ input: portraitLayer, top: H - meta.height, left: W - meta.width - 40 }])
      .toFile(cfg.file);
  } else {
    await base.toFile(cfg.file);
  }
  console.log('og:', cfg.file, portraitLayer ? '(with portrait)' : '(text-only)');
}
