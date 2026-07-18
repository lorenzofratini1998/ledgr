import { expect, test } from '@playwright/test';
import { deleteTestUserByEmail, createTestUser } from '../utils/supabase-admin';

test.describe('User Logout E2E Tests', () => {
  let testEmail: string;

  test.afterAll(async () => {
    if (testEmail) {
      await deleteTestUserByEmail(testEmail);
    }
  });

  test('AC-1: Logout successfully clears session and redirects to login', async ({ page }) => {
    const timestamp = Date.now();
    testEmail = `logout-${timestamp}@example.com`;
    const password = 'ValidPass123!';

    await createTestUser(testEmail, password);

    await page.goto('/login');
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.getByText('E2E User').click();
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
