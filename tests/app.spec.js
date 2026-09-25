import { test, expect } from '@playwright/test';

test.describe('App Initialization', () => {
  test('has correct title and login form', async ({ page }) => {
    // Navigate to the app (Playwright starts Vite automatically on port 5173)
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/vite/i); // You can update this to match your app title

    // Verify login heading is visible
    await expect(page.locator('h1', { hasText: 'Sign In to Proceed' })).toBeVisible();

    // Verify role selection buttons exist
    await expect(page.locator('button', { hasText: 'Student' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Faculty / HOD' })).toBeVisible();
  });
});
