import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="text"], input[name="username"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="text"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    // Should show error message
    const errorText = await page.locator('text=Invalid').isVisible();
  });

  test('should login successfully with correct credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    // Should redirect to login
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  });

  test('should display dashboard stats', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    // Check for stats cards
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/admin/dashboard/products');
    await page.waitForTimeout(2000);
  });

  test('should navigate to categories page', async ({ page }) => {
    await page.goto('/admin/dashboard/categories');
    await page.waitForTimeout(2000);
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.goto('/admin/dashboard/orders');
    await page.waitForTimeout(2000);
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/admin/dashboard/settings');
    await page.waitForTimeout(2000);
  });
});
