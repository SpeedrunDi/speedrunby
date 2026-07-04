import { test, expect } from '@playwright/test';

test('RU home renders with correct lang', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('h1')).toContainText('Amankeldi');
});

test('EN home renders with correct lang', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('Amankeldi');
});

test('dark theme is the default (no data-theme attribute)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
});

test('light OS preference applies light theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('404 page is served and bilingual', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Страница не найдена');
  await expect(page.locator('h2')).toContainText('Page not found');
});

test('reduced motion still shows all content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('motion path: content becomes visible after reveals boot', async ({ page }) => {
  await page.goto('/');
  // motion boots at idle — wait for its ready signal before scrolling
  await page.waitForFunction(() => (window as { __motionReady?: boolean }).__motionReady, null, {
    timeout: 10_000,
  });
  await page.locator('#about h2').scrollIntoViewIfNeeded();
  await expect(page.locator('#about h2')).toBeVisible();
  // reveal animation lasts ~1s — poll until it lands
  await expect
    .poll(() => page.locator('#about h2').evaluate((el) => Number(getComputedStyle(el).opacity)), {
      timeout: 6_000,
    })
    .toBeGreaterThan(0.5);
});

test('anchor nav scrolls to section', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as { __motionReady?: boolean }).__motionReady, null, {
    timeout: 10_000,
  });
  await page.click('a[href="#credentials"]');
  await expect
    .poll(
      () =>
        page
          .locator('#credentials')
          .evaluate((el) => el.getBoundingClientRect().top < window.innerHeight),
      { timeout: 6_000 },
    )
    .toBe(true);
});

test('keyboard: theme toggle is reachable and activates', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('#theme-toggle');
  await toggle.focus();
  await expect(toggle).toBeFocused();
  const before = await page.locator('html').getAttribute('data-theme');
  await page.keyboard.press('Enter');
  const after = await page.locator('html').getAttribute('data-theme');
  expect(after).not.toBe(before);
});

test('projects: collapsed by default, toggle reveals the rest', async ({ page }) => {
  await page.goto('/');
  const grid = page.locator('#more-projects');
  await expect(grid).toBeHidden();
  const btn = page.locator('[data-projects-toggle]');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(grid).toBeVisible();
  expect(await grid.locator('article').count()).toBeGreaterThan(5);
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
});
