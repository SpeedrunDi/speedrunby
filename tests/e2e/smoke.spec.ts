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
  // below-fold section content must end up visible once motion runs
  await page.locator('#about h2').scrollIntoViewIfNeeded();
  await expect(page.locator('#about h2')).toBeVisible();
  const opacity = await page
    .locator('#about h2')
    .evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBeGreaterThan(0.5);
});

test('anchor nav scrolls to section', async ({ page }) => {
  await page.goto('/');
  await page.click('a[href="#credentials"]');
  await page.waitForTimeout(1500);
  const inView = await page
    .locator('#credentials')
    .evaluate((el) => el.getBoundingClientRect().top < window.innerHeight);
  expect(inView).toBe(true);
});
