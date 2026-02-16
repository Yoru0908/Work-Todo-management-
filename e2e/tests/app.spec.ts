import { test, expect } from '@playwright/test';

test.describe('Warehouse Tasks E2E', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('TaskFlow');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('language switch works', async ({ page }) => {
    await page.goto('/login?lang=zh');
    await expect(page.locator('h1')).toContainText('TaskFlow');
    await expect(page.locator('text=任务管理系统')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'invalid');
    await page.fill('input[name="password"]', 'invalid');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-banner, .toast')).toBeVisible();
  });

  test('dashboard page requires auth', async ({ page }) => {
    await page.goto('/');
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('schedule page requires auth', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page).toHaveURL(/login/);
  });

  test('sku page requires auth', async ({ page }) => {
    await page.goto('/sku');
    await expect(page).toHaveURL(/login/);
  });
});
