import {expect, test} from '@playwright/test';
import {deleteTestUserByEmail} from '../utils/supabase-admin';

test.describe('Onboarding E2E Tests', () => {
  let testEmail: string;

  test.beforeEach(async ({ page }, testInfo) => {
    const timestamp = Date.now();
    testEmail = `onboarding-test-${testInfo.workerIndex}-${timestamp}@example.com`;

    // 1. Register a new user
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill('ValidPass123!');
    await page.getByLabel(/Confirm Password/i).fill('ValidPass123!');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    // 2. Wait for redirect to onboarding
    await expect(page).toHaveURL(/.*\/onboarding/);
  });

  test.afterEach(async () => {
    if (testEmail) {
      await deleteTestUserByEmail(testEmail);
    }
  });

  test('AC-1: Routing Protection intercepts protected routes', async ({ page }) => {
    // Attempt to access dashboard
    await page.goto('/');
    // Should be forcefully redirected back to onboarding
    await expect(page).toHaveURL(/.*\/onboarding/);
  });

  test('AC-2 & AC-3: Mandatory Fields and Currency Constraint warning', async ({ page }) => {
    // AC-2: Check mandatory fields labels are present
    await expect(page.getByText('Theme', { exact: true })).toBeVisible();
    await expect(page.getByText('Language', { exact: true })).toBeVisible();
    await expect(page.getByText('Date Format', { exact: true })).toBeVisible();
    
    // AC-3: Check currency field and warning
    await expect(page.getByText('Main Currency', { exact: true })).toBeVisible();
    await expect(page.getByText(/Your Main Currency is completely immutable and/i)).toBeVisible();
    await expect(page.getByText(/cannot be changed/i)).toBeVisible();
  });

  test('Phase 2: Skip Flow', async ({ page }) => {
    // Wait for hydration
    await page.waitForLoadState('networkidle');

    // Submit Step 1 (Preferences)
    await page.getByRole('button', { name: 'Continue' }).click();

    // Verify transition to Step 2 (Ecosystem)
    await expect(page.getByText('Set up your workspace', { exact: true })).toBeVisible();

    // Click Skip
    await page.getByRole('button', { name: 'Skip this step' }).click();

    // Verify it redirects away from onboarding to the dashboard
    await expect(page).not.toHaveURL(/.*\/onboarding/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Phase 2: Full Setup Flow', async ({ page }) => {
    // Wait for hydration
    await page.waitForLoadState('networkidle');

    // Submit Step 1 (Preferences)
    await page.getByRole('button', { name: 'Continue' }).click();

    // Verify transition to Step 2
    await expect(page.getByText('Set up your workspace', { exact: true })).toBeVisible();

    // Click + Add Wallet
    await page.getByRole('button', { name: '+ Add Wallet' }).click();

    // Fill in Wallet info
    await page.getByLabel('Wallet Name').fill('My First Wallet');
    await page.getByPlaceholder('0.00').fill('1500.50');

    // Submit Step 2 (Ecosystem)
    await page.getByRole('button', { name: 'Finish Setup' }).click();

    // Verify it redirects away from onboarding to the dashboard
    await expect(page).not.toHaveURL(/.*\/onboarding/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
