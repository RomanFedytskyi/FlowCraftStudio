import { expect, test } from '@playwright/test';

test.describe('account settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('create-diagram-input').fill('Settings Flow');
    await page.getByTestId('create-diagram-button').click();
    await page.getByTestId('back-to-dashboard').click();
  });

  test('opens settings, shows summary and clears local data', async ({
    page,
  }) => {
    page.on('dialog', (dialog) => dialog.accept());

    await page.getByTestId('open-account-settings').click();
    await expect(page.getByTestId('account-settings-modal')).toBeVisible();
    await expect(page.getByTestId('storage-usage-summary')).toBeVisible();
    await expect(page.getByTestId('theme-option-light')).toBeVisible();
    await page.getByTestId('theme-option-dark').click();
    await expect(page.locator('html')).toHaveClass('dark');

    await page.getByTestId('clear-local-data-button').click();
    await expect(page.getByTestId('storage-usage-summary')).toContainText('0');
    await page.getByTestId('close-account-settings').click();
    await expect(page.getByTestId('dashboard-empty-state')).toBeVisible();
  });
});
