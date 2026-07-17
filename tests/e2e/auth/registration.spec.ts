import { test, expect } from '@playwright/test';
import { deleteTestUserByEmail } from '../utils/supabase-admin';

test.describe('User Registration E2E Tests', () => {
  let testEmail: string;

  test.afterAll(async () => {
    if (testEmail) {
      await deleteTestUserByEmail(testEmail);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
  });

  test('AC-1: Form Fields display correctly', async ({ page }) => {
    await expect(page.getByLabel(/First Name/i)).toBeVisible();
    await expect(page.getByLabel(/Last Name/i)).toBeVisible();
    await expect(page.getByLabel(/^Email$/i)).toBeVisible();
    await expect(page.getByLabel(/^Password$/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeVisible();
  });

  test('AC-2: Password Validation enforces complexity rules via UI', async ({ page }) => {
    await page.getByLabel(/^Email$/i).fill('test@example.com');

    await page.getByLabel(/^Password$/i).fill('password123!');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await expect(page.getByText('Password must contain at least 1 uppercase letter.')).toBeVisible();
    await page.getByLabel(/^Password$/i).fill('Password!');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await expect(page.getByText('Password must contain at least 1 number.')).toBeVisible();

    await page.getByLabel(/^Password$/i).fill('Password123');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await expect(page.getByText('Password must contain at least 1 special character.')).toBeVisible();
    await page.getByLabel(/^Password$/i).fill('ValidPass123!');
    await page.getByLabel(/Confirm Password/i).fill('DifferentPass123!');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('AC-3: Success Redirect to dashboard (intercepted by onboarding)', async ({ page }) => {
    const timestamp = Date.now();
    testEmail = `test-${timestamp}@example.com`;
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill('ValidPass123!');
    await page.getByLabel(/Confirm Password/i).fill('ValidPass123!');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    await expect(page).toHaveURL(/.*\/onboarding/);
  });

  test('AC-4: Failed Login', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/^Email$/i).fill('nonexistent@example.com');
    await page.getByLabel(/^Password$/i).fill('ValidPass123!');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });
});
