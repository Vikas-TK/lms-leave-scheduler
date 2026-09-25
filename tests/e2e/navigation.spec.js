// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Navigation & UI Shell
 * 
 * Tests the NavigationShell component:
 * - Sidebar renders with correct links
 * - Notifications dropdown works
 * - Profile dropdown works
 * - Tab navigation works correctly
 * - Role-based nav items are present
 */

test.describe('Navigation Shell & UI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const idInput = page.locator('input').first();
    const passwordInput = page.locator('input[type="password"]');

    await idInput.fill('HODCS');
    await passwordInput.fill('hod123');

    const signInBtn = page.locator('button').filter({ hasText: /sign|log|enter/i }).first();
    await signInBtn.click();

    await expect(page.locator('input[type="password"]')).toBeHidden({ timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  test('should display the OD PORTAL brand in sidebar', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/OD PORTAL/i);
  });

  test('should display the correct role badge for HOD', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Head of Dept|HOD/i);
  });

  test('should have navigation links: Home, Applications, History, Approvals', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'Home' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Applications' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'History' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Approvals' })).toBeVisible();
  });

  test('should navigate between tabs without errors', async ({ page }) => {
    // Click Applications
    await page.locator('button').filter({ hasText: 'Applications' }).click();
    await page.waitForTimeout(1000);

    // Click History
    await page.locator('button').filter({ hasText: 'History' }).click();
    await page.waitForTimeout(1000);

    // Click Approvals
    await page.locator('button').filter({ hasText: 'Approvals' }).click();
    await page.waitForTimeout(1000);

    // Click Home
    await page.locator('button').filter({ hasText: 'Home' }).click();
    await page.waitForTimeout(1000);

    // No errors — page should still be functional
    await expect(page.locator('body')).toContainText(/OD PORTAL/i);
  });

  test('should have a notification bell button', async ({ page }) => {
    // The bell icon button in header
    const bellBtn = page.locator('.ns-header-btn').first();
    await expect(bellBtn).toBeVisible();
  });

  test('should have a logout button in the sidebar', async ({ page }) => {
    const logoutBtn = page.locator('button').filter({ hasText: /logout|sign out/i }).first();
    await expect(logoutBtn).toBeVisible();
  });

  test('should return to sign-in page after logout', async ({ page }) => {
    const logoutBtn = page.locator('button').filter({ hasText: /logout|sign out/i }).first();
    await logoutBtn.click();

    // Should be back on the sign-in page
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 });
  });
});
