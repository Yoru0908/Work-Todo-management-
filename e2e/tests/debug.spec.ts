import { test, expect } from '@playwright/test';

test('login debug', async ({ page }) => {
  await page.goto('/login');

  // Fill form
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');

  // Submit
  await page.click('button[type="submit"]');

  // Wait a bit
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());
  console.log('Page content:', await page.content());
});
