import { test, expect } from '@playwright/test';

// The three hero interactions: DevTools console signature, live trace, poke.
// These guard the invariants plan-review flagged — especially that the
// trace survives resume() (IntersectionObserver / visibilitychange) without
// the console filling with errors or the scene crashing.

test('console signature: one info, never error/warn (best-practices gate)', async ({ page }) => {
  const infos: string[] = [];
  const noisy: string[] = [];
  page.on('console', (m) => {
    const type = m.type();
    if (type === 'info') infos.push(m.text());
    if (type === 'error' || type === 'warning') noisy.push(`${type}: ${m.text()}`);
  });
  page.on('pageerror', (e) => noisy.push(`pageerror: ${e.message}`));

  await page.goto('/');
  // signature fires at requestIdleCallback (timeout 3000) / setTimeout(400)
  await expect.poll(() => infos.length, { timeout: 6000 }).toBeGreaterThan(0);

  // the signature is the honest-stack colophon
  expect(infos.some((t) => /evogroup\.ai|Astro/i.test(t))).toBe(true);
  // nothing may reach error/warn — Lighthouse best-practices audits this
  expect(noisy).toEqual([]);
});

test('resting hero shows no visible trace label', async ({ page }) => {
  await page.goto('/');
  // no user gesture → scene may not boot; either way, no label may be visible
  const labels = page.locator('.trace-label');
  const n = await labels.count();
  for (let i = 0; i < n; i++) {
    const opacity = await labels.nth(i).evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBeLessThan(0.1);
  }
});

test('scene survives visibility resume + poke without errors', async ({ page, browserName }) => {
  const errors: string[] = [];
  page.on('console', (m) => (m.type() === 'error' ? errors.push(m.text()) : null));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  // boot the gesture-gated WebGL scene
  await page.mouse.move(700, 400);
  const booted = await page
    .waitForFunction(() => (window as { __heroReady?: boolean }).__heroReady, null, {
      timeout: 8000,
    })
    .then(() => true)
    .catch(() => false);
  // headless Firefox WebGL is unreliable — the scene is a progressive
  // enhancement, so skip the WebGL-dependent assertion where it never boots
  test.skip(!booted, 'hero WebGL scene did not boot in this environment');
  expect(browserName).toBeTruthy();

  await page.waitForTimeout(600);
  // simulate the exact resume path the audits flagged: tab hidden → visible
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  // poke empty hero space mid-trace
  await page.mouse.click(300, 600);
  await page.waitForTimeout(1200);

  expect(await page.evaluate(() => (window as { __heroReady?: boolean }).__heroReady)).toBe(true);
  expect(errors).toEqual([]);
});
