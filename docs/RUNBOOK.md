# Runbook

Operational notes for `speedrunby.pages.dev`.

## Local development

```sh
pnpm install
pnpm dev                 # dev server on :4321
pnpm build               # prod build (prebuild regenerates OG cards)
pnpm preview             # serve dist/
pnpm test:e2e            # Playwright smoke (chromium + firefox)
pnpm lhci                # Lighthouse CI locally (needs Chrome)
pnpm validate            # zod content validation
pnpm check:confidential  # confidentiality grep (needs needles, see below)
```

## Deploy flow

1. Branch (`feat/*`, `fix/*`, `ci/*`) → PR to `main`.
2. CI runs 6 required checks + Cloudflare Pages builds a **preview URL** on the PR.
3. Squash-merge → Pages builds `main` → production. No manual deploy step exists.

**Rollback:** Cloudflare dashboard → Workers & Pages → speedrunby → Deployments →
"Rollback to this deployment" (instant). Fix-forward via `git revert` PR when the
bad state must leave `main` too.

## Adding a project entry

1. Edit `src/data/projects.ts` (typed, bilingual `L<ru,en>`; `confidential: true`
   suppresses links by construction).
2. `pnpm validate` locally, PR, check the Pages preview, merge.

## Confidentiality needles

`scripts/check-confidential.mjs` greps every tracked file **and** `dist/` for
forbidden terms. The list lives ONLY in:

- CI: the `FORBIDDEN_TERMS` GitHub Actions secret (comma-separated), or
- locally: git-ignored `.forbidden-terms.local`.

Never commit the needles. The script prints needle _indexes_, not values, and
fails closed in CI when the secret is missing.

## Photo / media

Source images live in git-ignored `_originals/`. The portrait pipeline
(cutout → webp + depth map) writes tracked assets to `public/images/`.
⚠️ Public git history is permanent: replacing a committed photo does not erase
it from history — full retraction would require a history rewrite.

## Custom domain (later)

1. Cloudflare Pages → Custom domains → add domain (cert is automatic).
2. Update `site` in `astro.config.mjs` and the sitemap URL in `public/robots.txt`.
3. Resubmit the sitemap in Search Console.

## Vercel fallback

The build is host-agnostic static output. If Cloudflare ever becomes a problem:
import the repo in Vercel (framework: Astro, output `dist/`) and port the
headers from `public/_headers` into `vercel.json`. The only Cloudflare-specific
artifact is `_headers` itself.

## Contact worker (post-launch, optional)

A hardened Telegram relay worker (origin check, rate limit, honeypot) can be
added under `workers/contact/` per the launch plan; secrets go in via
`wrangler secret put`, never the repo. Update the CSP `connect-src` when wiring
the form.
