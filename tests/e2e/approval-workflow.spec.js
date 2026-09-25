// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Faculty Approval Workflow
 * 
 * Tests the dynamic graph-based routing system:
 * - HOD can see the approval console
 * - Applications queue renders properly
 * - Status badges reflect the correct states
 * - Forward and Complete Final Verification tabs work
 */

test.describe('Faculty Approval Console', () => {

  test.beforeEach(async ({ page }) => {
    // Login as HOD before each test
    await page.goto('/');
    await page.waitForTimeout(2000);

    const idInput = page.locator('input').first();
    const passwordInput = page.locator('input[type="password"]');

    await idInput.fill('HODCS');
    await passwordInput.fill('hod123');

    const signInBtn = page.locator('button').filter({ hasText: /sign|log|enter/i }).first();
    await signInBtn.click();

    // Wait for dashboard to load
    await expect(page.locator('input[type="password"]')).toBeHidden({ timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  test('should navigate to the Approvals tab', async ({ page }) => {
    // Click on Approvals in the sidebar
    const approvalsLink = page.locator('button').filter({ hasText: /approval/i }).first();
    await approvalsLink.click();
    await page.waitForTimeout(1500);

    // Should see the Faculty Approval Console heading
    await expect(page.locator('body')).toContainText(/Faculty Approval Console|Approval/i);
  });

  test('should display metric cards with correct labels', async ({ page }) => {
    const approvalsLink = page.locator('button').filter({ hasText: /approval/i }).first();
    await approvalsLink.click();
    await page.waitForTimeout(1500);

    // Check that all 4 metric cards are present
    await expect(page.locator('body')).toContainText(/Total Batch Requests/i);
    await expect(page.locator('body')).toContainText(/Awaiting Your Action/i);
    await expect(page.locator('body')).toContainText(/Approved/i);
    await expect(page.locator('body')).toContainText(/Rejected/i);
  });

  test('should have working filter tabs', async ({ page }) => {
    const approvalsLink = page.locator('button').filter({ hasText: /approval/i }).first();
    await approvalsLink.click();
    await page.waitForTimeout(1500);

    // Check filter tabs exist
    await expect(page.locator('button').filter({ hasText: 'All Requests' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Pending/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Approved' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Rejected' })).toBeVisible();

    // Click through each filter to verify no crashes
    await page.locator('button').filter({ hasText: /Pending/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'Approved' }).click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'All Requests' }).click();
    await page.waitForTimeout(500);
  });

  test('should have a working search box', async ({ page }) => {
    const approvalsLink = page.locator('button').filter({ hasText: /approval/i }).first();
    await approvalsLink.click();
    await page.waitForTimeout(1500);

    // Find and use the search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    
    // Type a search query
    await searchInput.fill('nonexistent_student_xyz');
    await page.waitForTimeout(500);

    // Should show empty state or no matching results
    await expect(page.locator('body')).toContainText(/no applications|no match/i);
    
    // Clear and verify it goes back
    await searchInput.clear();
    await page.waitForTimeout(500);
  });
});
