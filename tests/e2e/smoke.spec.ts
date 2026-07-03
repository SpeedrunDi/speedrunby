import { test, expect } from '@playwright/test';

// Trivial smoke for the CI pipeline bootstrap phase.
// Grows with the site: i18n switch, theme toggle, reduced-motion, 404.
test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
