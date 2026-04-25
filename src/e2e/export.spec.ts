import { expect, test } from '@playwright/test';

test.describe('export menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('create-diagram-input').fill('Export Flow');
    await page.getByTestId('create-diagram-button').click();
  });

  test('shows export actions', async ({ page }) => {
    await page.getByTestId('export-toggle').click();
    await expect(
      page.getByTestId('export-action-png-full-diagram'),
    ).toBeVisible();
    await expect(
      page.getByTestId('export-action-pdf-full-diagram'),
    ).toBeVisible();
  });
});
