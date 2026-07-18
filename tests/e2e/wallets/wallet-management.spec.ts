import { expect, test } from '@playwright/test';
import { createTestUser, deleteTestUserByEmail } from '../utils/supabase-admin';

test.describe('Wallet Management E2E Tests', () => {
  let testEmail: string;

  test.afterAll(async () => {
    if (testEmail) {
      await deleteTestUserByEmail(testEmail);
    }
  });

  test('AC-1 to AC-6: Wallet Creation, Multi-Currency, Editing and Net Worth Exclusion', async ({ page }) => {
    const timestamp = Date.now();
    testEmail = `wallet-tester-${timestamp}@example.com`;
    const password = 'ValidPass123!';

    await createTestUser(testEmail, password);

    await page.goto('/login');
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);

    await page.goto('/wallets');
    await expect(page).toHaveURL(/.*\/wallets/);

    const walletName = `Test Wallet ${timestamp}`;

    await page.getByRole('button', { name: /New Wallet/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/Wallet Name/i).fill(walletName);

    await page.getByRole('combobox', { name: /Type/i }).click();
    await page.getByRole('option', { name: 'Savings' }).click();

    await page.getByPlaceholder('0.00').fill('1500.50');

    await page.getByRole('switch', { name: /Exclude from Net Worth/i }).click();

    await page.getByRole('button', { name: 'Create Wallet' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();

    const walletCard = page.locator('[data-slot="card"]').filter({ hasText: walletName }).first();
    await expect(walletCard).toBeAttached();
    await expect(walletCard).toContainText('$1,500.50');
    await expect(walletCard.locator('[title="Excluded from Net Worth"]')).toBeAttached();

    await walletCard.locator('[data-slot="dropdown-menu-trigger"]').evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(500);
    await page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Edit' }).evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await expect(page.getByRole('dialog')).toBeVisible();

    const currencyCombobox = page.getByRole('dialog').getByRole('combobox', { disabled: true });
    await expect(currencyCombobox).toBeVisible();
    const updatedName = `${walletName} Updated`;
    await page.getByLabel(/Wallet Name/i).fill(updatedName);
    await page.getByPlaceholder('0.00').fill('2000.00');

    await page.getByRole('switch', { name: /Exclude from Net Worth/i }).click();

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();
    const updatedWalletCard = page.locator('[data-slot="card"]').filter({ hasText: updatedName }).first();
    await expect(updatedWalletCard).toBeAttached();
    await expect(updatedWalletCard).toContainText('$2,000.00');
    await expect(updatedWalletCard.locator('[title="Excluded from Net Worth"]')).toBeHidden();

    // ---- WALLET ARCHIVE (Story 2 AC-1 & AC-2) ----
    await updatedWalletCard.locator('[data-slot="dropdown-menu-trigger"]').evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    
    await page.waitForTimeout(500);
    await page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Archive' }).evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByRole('alertdialog')).toBeHidden();

    // Verify it disappeared from Active
    await expect(updatedWalletCard).toBeHidden();

    // Go to Archived tab
    await page.getByRole('tab', { name: 'Archived' }).click();
    const archivedWalletCard = page.locator('[data-slot="card"]').filter({ hasText: updatedName }).first();
    await expect(archivedWalletCard).toBeAttached();
    await expect(archivedWalletCard).toContainText('$2,000.00');

    // ---- WALLET DELETE (Story 2 AC-3 Hard Deletion with Confirmation) ----
    await archivedWalletCard.locator('[data-slot="dropdown-menu-trigger"]').evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(500);
    await page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Delete Permanently' }).evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await expect(page.getByRole('alertdialog')).toBeVisible();
    const deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
    
    // Verify it is disabled initially
    await expect(deleteButton).toBeDisabled();

    // Type wrong name
    await page.getByRole('textbox').fill('Wrong Name');
    await expect(deleteButton).toBeDisabled();

    // Type correct name
    await page.getByRole('textbox').fill(updatedName);
    await expect(deleteButton).toBeEnabled();

    // Execute Delete
    await deleteButton.click();
    await expect(page.getByRole('alertdialog')).toBeHidden();

    // Verify it is gone permanently
    await expect(archivedWalletCard).toBeHidden();
  });
});
