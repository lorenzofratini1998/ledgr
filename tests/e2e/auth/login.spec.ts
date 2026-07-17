import { test, expect } from '@playwright/test';
import { deleteTestUserByEmail } from '../utils/supabase-admin';

test.describe('User Login E2E Tests', () => {
  let testEmail: string;

  test.afterAll(async () => {
    if (testEmail) {
      await deleteTestUserByEmail(testEmail);
    }
  });

  test('AC-1: Unauthorized Redirect', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('AC-2: Failed Authentication', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^Email$/i).fill('wrong-email@example.com');
    await page.getByLabel(/^Password$/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });

  test('AC-3: First-Time Login Redirect', async ({ page }) => {
    const timestamp = Date.now();
    testEmail = `login-${timestamp}@example.com`;
    const password = 'ValidPass123!';

    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(password);
    await page.getByLabel(/Confirm Password/i).fill(password);
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    await expect(page).toHaveURL(/.*\/onboarding/);

    await page.context().clearCookies();

    await page.goto('/login');
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page).toHaveURL(/.*\/onboarding/);
  });

});
