import { test, expect } from '@playwright/test';
import { deleteTestUserByEmail } from '../utils/supabase-admin';

test.describe.serial('Password Reset E2E Tests', () => {
  let testEmail: string;

  test.beforeAll(async ({ browser }) => {
    // Register the user before testing
    const timestamp = Date.now();
    testEmail = `reset-${timestamp}@example.com`;
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill('OldPass123!');
    await page.getByLabel(/Confirm Password/i).fill('OldPass123!');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await expect(page).toHaveURL(/.*\/onboarding/);
    await context.close();
  });

  test.afterAll(async () => {
    if (testEmail) {
      await deleteTestUserByEmail(testEmail);
    }
  });

  test('Password Reset Flow', async ({ page, request }) => {
    // AC-1: Navigate to login and find forgot password
    await page.goto('/login');
    const forgotPasswordLink = page.getByRole('link', { name: /Forgot your password\?/i });
    await expect(forgotPasswordLink).toBeVisible();
    await forgotPasswordLink.click();

    // Check url is /forgot-password
    await expect(page).toHaveURL(/.*\/forgot-password/);

    // AC-2: Form contains email input and submit
    await expect(page.getByLabel(/^Email$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Reset Link/i })).toBeVisible();

    // AC-3: Generic success feedback
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByRole('button', { name: /Send Reset Link/i }).click();
    await expect(page.getByText(/If an account exists with this email, a password reset link has been sent/i)).toBeVisible();

    // 1. Fetch the email from Mailpit API
    let resetLink = '';

    for (let i = 0; i < 5; i++) {
      const response = await request.get(`http://127.0.0.1:54324/api/v1/messages`);
      if (response.ok()) {
        const data = await response.json();
        // Find message for our testEmail
        const message = data.messages?.find((m: any) => m.To?.some((t: any) => t.Address === testEmail));

        if (message) {
          const bodyResponse = await request.get(`http://127.0.0.1:54324/api/v1/message/${message.ID}`);
          const body = await bodyResponse.json();

          // Regex to extract the token link from the plaintext email body
          const match = body.Text.match(/(http:\/\/[^\/]+\/auth\/v1\/verify\?[^\s"'<>\)]+)/);
          if (match) {
            resetLink = match[1];
            break;
          }
        }
      }
      await page.waitForTimeout(1000);
    }

    expect(resetLink).not.toBe('');

    // AC-5: Navigate to reset link
    await page.goto(resetLink);
    // Should automatically exchange token and redirect to /update-password
    await expect(page).toHaveURL(/.*\/update-password/);

    // AC-6: Password validation
    await page.getByLabel(/^New Password$/i).fill('weak');
    await page.getByRole('button', { name: /Update Password/i }).click();
    // Assuming error messages map to zod schema translations
    await expect(page.getByText(/Password must be at least 8 characters long/i)).toBeVisible();

    // AC-7: Successful update
    await page.getByLabel(/^New Password$/i).fill('NewStrongPass123!');
    await page.getByLabel(/Confirm New Password/i).fill('NewStrongPass123!');
    await page.getByRole('button', { name: /Update Password/i }).click();

    await page.waitForTimeout(2000);

    // Expect success toast first to see if action succeeded
    await expect(page).toHaveURL(/.*\/login/);

    // Verify we can log in with new password
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill('NewStrongPass123!');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // User should be in since login succeeds
    await expect(page).toHaveURL(/.*\/onboarding/); // Because the user hasn't onboarded yet!
  });

  test('AC-4: Rate Limiting (Too Many Requests)', async ({ page }) => {
    // Use a fresh email for rate limit testing so it doesn't interfere with the main user
    const rateLimitEmail = `ratelimit-${Date.now()}@example.com`;

    // Create the user first! Supabase doesn't rate-limit non-existent users (prevents enumeration)
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByLabel(/^Email$/i).fill(rateLimitEmail);
    await page.getByLabel(/^Password$/i).fill('StrongPass123!');
    await page.getByLabel(/Confirm Password/i).fill('StrongPass123!');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await expect(page).toHaveURL(/.*\/onboarding/);

    // Log the user out so they can visit /forgot-password
    await page.context().clearCookies();

    await page.goto('/forgot-password');

    // First request
    await page.getByLabel(/^Email$/i).fill(rateLimitEmail);
    await page.getByRole('button', { name: /Send Reset Link/i }).click();
    await expect(page.getByText(/If an account exists with this email, a password reset link has been sent/i)).toBeVisible();

    // Second request immediately after
    await page.goto('/forgot-password');
    await page.getByLabel(/^Email$/i).fill(rateLimitEmail);
    await page.getByRole('button', { name: /Send Reset Link/i }).click();

    // Should hit 429 Rate Limit
    await expect(page.getByText(/You can only request a reset link once per minute/i)).toBeVisible();

    // Cleanup
    await deleteTestUserByEmail(rateLimitEmail);
  });
});
