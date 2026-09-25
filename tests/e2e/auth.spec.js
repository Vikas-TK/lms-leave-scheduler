// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Sign-In Flow
 * 
 * Tests the authentication system for all three user roles:
 * student, advisor, and hod.
 */

test.describe('Authentication & Sign-In', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the sign-in page on initial load', async ({ page }) => {
    // The sign-in page should be visible
    await expect(page.locator('body')).toBeVisible();
    // Look for any input field (login form)
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible({ timeout: 15000 });
  });

  test('should reject invalid credentials', async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForTimeout(2000);
    
    // Find ID input and password input
    const idInput = page.locator('input').first();
    const passwordInput = page.locator('input[type="password"]');
    
    await idInput.fill('INVALID_USER_999');
    await passwordInput.fill('wrong_password');
    
    // Click the sign-in button
    const signInBtn = page.locator('button').filter({ hasText: /sign|log|enter/i }).first();
    await signInBtn.click();
    
    // Should remain on the sign-in page (not navigate away)
    await page.waitForTimeout(1500);
    await expect(passwordInput).toBeVisible();
  });

  test('should successfully log in as HOD and see the dashboard', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const idInput = page.locator('input').first();
    const passwordInput = page.locator('input[type="password"]');
    
    await idInput.fill('HODCS');
    await passwordInput.fill('hod123');
    
    const signInBtn = page.locator('button').filter({ hasText: /sign|log|enter/i }).first();
    await signInBtn.click();
    
    // After login, the dashboard should appear (sign-in form should disappear)
    await expect(page.locator('input[type="password"]')).toBeHidden({ timeout: 15000 });
    
    // Should see the navigation shell / dashboard content
    await expect(page.locator('body')).toContainText(/portal|dashboard|approval|home/i, { timeout: 10000 });
  });

  test('should successfully log in as Advisor', async ({ page }) => {
    await page.waitForTimeout(2000);

    const idInput = page.locator('input').first();
    const passwordInput = page.locator('input[type="password"]');

    await idInput.fill('ADVCS3A');
    await passwordInput.fill('advisor123');

    const signInBtn = page.locator('button').filter({ hasText: /sign|log|enter/i }).first();
    await signInBtn.click();

    await expect(page.locator('input[type="password"]')).toBeHidden({ timeout: 15000 });
    await expect(page.locator('body')).toContainText(/portal|dashboard|approval|home/i, { timeout: 10000 });
  });
});
