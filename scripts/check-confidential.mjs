// Post-build confidentiality invariant (CI job: build, after `astro build`).
//
// Greps the ENTIRE commit tree (`git ls-files` — including scripts/, README,
// docs) plus the built dist/ for forbidden terms. The needle list is NEVER
// stored in the repo — a public repo would otherwise leak the very strings
// it is protecting. Sources, in priority order:
//   1. FORBIDDEN_TERMS env (comma-separated) — GitHub Actions secret in CI
//   2. .forbidden-terms.local — git-ignored local file
// Fail-closed: in CI (CI=true) a missing needle source is an error.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let raw = process.env.FORBIDDEN_TERMS ?? '';
if (!raw && existsSync('.forbidden-terms.local')) {
  raw = readFileSync('.forbidden-terms.local', 'utf8');
}
const needles = raw
  .split(/[,\n]/)
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (needles.length === 0) {
  const msg =
    'check-confidential: no needle source (FORBIDDEN_TERMS env or .forbidden-terms.local).';
  if (process.env.CI) {
    console.error(`✗ ${msg} Failing closed in CI.`);
    process.exit(1);
  }
  console.warn(`⚠ ${msg} Skipping locally.`);
  process.exit(0);
}

const files = [];
// 1) every tracked file (checks the tree AND this script itself)
execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .forEach((f) => files.push(f));
// 2) the built output
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else files.push(p);
  }
};
if (existsSync('dist')) walk('dist');

const TEXT_EXT = /\.(astro|ts|tsx|js|mjs|cjs|json|md|css|html|xml|txt|yml|yaml|svg|webmanifest)$/i;
let hits = 0;
for (const file of files) {
  if (!TEXT_EXT.test(file)) continue;
  let content;
  try {
    content = readFileSync(file, 'utf8').toLowerCase();
  } catch {
    continue;
  }
  for (const needle of needles) {
    if (content.includes(needle)) {
      // never print the needle itself — index only
      console.error(`✗ forbidden term #${needles.indexOf(needle)} found in: ${file}`);
      hits++;
    }
  }
}

if (hits > 0) {
  console.error(`check-confidential FAILED: ${hits} hit(s).`);
  process.exit(1);
}
console.log(
  `check-confidential passed (${files.length} files scanned, ${needles.length} needles).`,
);
