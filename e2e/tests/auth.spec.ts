import { test, expect } from '@playwright/test';

test.describe('Authenticated Tests', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('dashboard loads with stats', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.locator('h2')).toContainText('ダッシュボード');
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });

  test('task list page loads', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.locator('h2')).toContainText('タスク一覧');
    await expect(page.locator('.task-table')).toBeVisible();
  });

  test('can open task modal', async ({ page }) => {
    await page.goto('/tasks');
    await page.click('button:has-text("追加")');
    await expect(page.locator('#taskModal')).toBeVisible();
    await expect(page.locator('#taskTitle')).toBeVisible();
  });

  test('schedule page loads', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.locator('h2')).toContainText('新入庫スケジュール');
    await expect(page.locator('.tabs')).toBeVisible();
  });

  test('sku page loads', async ({ page }) => {
    await page.goto('/sku');
    await expect(page.locator('h2')).toContainText('SKU入庫明細');
    await expect(page.locator('.tabs')).toBeVisible();
  });

  test('tab switching works on schedule page', async ({ page }) => {
    await page.goto('/schedule');
    // Default is view tab
    await expect(page.locator('#tabView')).toBeVisible();
    await expect(page.locator('#tabAi')).toHaveClass(/hidden/);

    // Click AI tab
    await page.click('.tab:has-text("AI解析追加")');
    await expect(page.locator('#tabView')).toHaveClass(/hidden/);
    await expect(page.locator('#tabAi')).toBeVisible();
  });

  test('logout works', async ({ page }) => {
    await page.click('a:has-text("ログアウト")');
    await expect(page).toHaveURL(/login/);
  });
});
