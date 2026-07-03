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
