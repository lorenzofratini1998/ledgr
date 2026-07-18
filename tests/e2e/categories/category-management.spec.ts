import { expect, test } from '@playwright/test';
import { createTestUser, deleteTestUserByEmail } from '../utils/supabase-admin';

test.describe('Category Management E2E Tests', () => {
  let testEmail: string;

  test.afterAll(async () => {
    if (testEmail) {
      await deleteTestUserByEmail(testEmail);
    }
  });

  test('AC-1 to AC-4: Category Creation, Hierarchy, and Editing', async ({ page }) => {
    const timestamp = Date.now();
    testEmail = `category-tester-${timestamp}@example.com`;
    const password = 'ValidPass123!';

    await createTestUser(testEmail, password);

    await page.goto('/login');
    await page.getByLabel(/^Email$/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);

    await page.goto('/categories');
    await expect(page).toHaveURL(/.*\/categories/);

    const parentName = `Parent Category ${timestamp}`;
    const subName = `Sub Category ${timestamp}`;

    await page.getByRole('button', { name: /New Category/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/^Name$/i).fill(parentName);
    await page.getByLabel(/^Description/i).fill('This is a parent category');

    await page.getByRole('button', { name: 'Create Category' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    const masterListItem = page.locator('.divide-y > div').filter({ hasText: parentName }).first();
    await expect(masterListItem).toBeAttached();

    await masterListItem.evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Verify Detail View shows the category
    const detailHeader = page.locator('h2').filter({ hasText: parentName });
    await expect(detailHeader).toBeAttached();
    await expect(page.getByText('This is a parent category')).toBeAttached();

    await page.getByText('Add Subcategory').evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(page.getByRole('dialog')).toBeVisible();

    // The Parent Category should be pre-selected, but let's just fill the name
    await page.getByLabel(/^Name$/i).fill(subName);
    await page.getByRole('button', { name: 'Create Category' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // Verify Subcategory appears in the detail list
    const subListItem = page.locator('.divide-y > div').filter({ hasText: subName }).first();
    await expect(subListItem).toBeAttached();

    // Click the Edit action in the Detail View Header
    // The Detail Header has a CategoryActions component (dropdown)
    const detailHeaderContainer = page.locator('.flex.items-center.gap-2').filter({ has: page.locator('h2', { hasText: parentName }) }).first();
    const headerActionsTrigger = detailHeaderContainer.locator('[data-slot="dropdown-menu-trigger"]');
    await headerActionsTrigger.evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(500);
    await page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Edit' }).evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await expect(page.getByRole('dialog')).toBeVisible();
    const updatedParentName = `${parentName} Updated`;
    await page.getByLabel(/^Name$/i).fill(updatedParentName);
    await page.getByRole('button', { name: 'Save Changes' }).click({ force: true });
    await expect(page.getByRole('dialog')).toBeHidden();

    // Verify parent is updated
    await expect(page.locator('h2').filter({ hasText: updatedParentName })).toBeAttached();

    const subActionTrigger = subListItem.locator('[data-slot="dropdown-menu-trigger"]');
    await subActionTrigger.evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(500);
    await page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Edit' }).evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await expect(page.getByRole('dialog')).toBeVisible();
    const updatedSubName = `${subName} Updated`;
    await page.getByLabel(/^Name$/i).fill(updatedSubName);
    await page.getByRole('button', { name: 'Save Changes' }).click({ force: true });
    await expect(page.getByRole('dialog')).toBeHidden();

    // Verify sub is updated
    await expect(page.locator('.divide-y > div').filter({ hasText: updatedSubName })).toBeAttached();

    // 7. Delete Parent with children (AC-4)
    await headerActionsTrigger.evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    
    await page.waitForTimeout(500);
    await page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Delete' }).evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // First dialog: standard delete confirmation
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    
    // Second dialog: HAS_CHILDREN warning prompt
    await expect(page.getByRole('alertdialog').filter({ hasText: 'Warning: Category has children' })).toBeVisible();
    
    // Confirm delete all
    await page.getByRole('button', { name: 'Delete all', exact: true }).click();
    
    // Wait for the dialog to close
    await expect(page.getByRole('alertdialog').filter({ hasText: 'Warning: Category has children' })).toBeHidden();
    
    // Verify it disappears from the DOM completely
    await expect(page.getByText(updatedParentName, { exact: true })).toHaveCount(0);
  });
});
