import { expect, test } from '@playwright/test';

test.describe('dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('creates, duplicates, deletes, and persists diagrams', async ({
    page,
  }) => {
    await page.getByTestId('create-diagram-input').fill('Operations Flow');
    await page.getByTestId('create-diagram-button').click();

    await expect(page).toHaveURL(/\/diagram\//);

    await page.getByTestId('back-to-dashboard').click();
    await expect(
      page.getByRole('heading', { name: 'Operations Flow', exact: true }),
    ).toBeVisible();

    const originalCard = page.locator('[data-testid^="diagram-card-"]').filter({
      has: page.getByRole('heading', { name: 'Operations Flow', exact: true }),
    });

    await originalCard.getByText('Duplicate').click();
    await expect(
      page.getByRole('heading', { name: 'Operations Flow Copy', exact: true }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Operations Flow', exact: true }),
    ).toBeVisible();

    const reloadedOriginalCard = page
      .locator('[data-testid^="diagram-card-"]')
      .filter({
        has: page.getByRole('heading', {
          name: 'Operations Flow',
          exact: true,
        }),
      });

    await reloadedOriginalCard.getByText('Delete').click();
    await expect(
      page.getByRole('heading', { name: 'Operations Flow', exact: true }),
    ).toHaveCount(0);
  });

  test('handles corrupted local storage gracefully', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('flowcraft-studio:diagrams:v1', '{bad json');
    });
    await page.reload();

    await expect(page.getByTestId('dashboard-empty-state')).toBeVisible();
  });
});
