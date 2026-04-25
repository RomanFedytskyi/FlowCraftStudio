import { expect, test, type Locator, type Page } from '@playwright/test';

async function createFreshDiagram(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('create-diagram-input').fill('Editor Flow');
  await page.getByTestId('create-diagram-button').click();
}

async function dragNodeBy(
  page: Page,
  node: Locator,
  delta: { x: number; y: number },
) {
  const box = await node.boundingBox();

  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + delta.x,
    box!.y + box!.height / 2 + delta.y,
    { steps: 12 },
  );
  await page.mouse.up();
}

/** Clicks the right portion of the node shell so the left sidebar does not intercept. */
async function clickDiagramNode(page: Page, node: Locator) {
  const box = await node.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + Math.max(32, box!.width * 0.72);
  const y = box!.y + Math.min(40, Math.max(16, box!.height / 2));
  await page.mouse.click(x, y);
}

async function resizeNodeBy(
  page: Page,
  node: Locator,
  delta: { x: number; y: number },
) {
  await clickDiagramNode(page, node);
  const handle = node.locator('.react-flow__resize-control').last();
  await expect(handle).toBeVisible();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + delta.x,
    box!.y + box!.height / 2 + delta.y,
    {
      steps: 10,
    },
  );
  await page.mouse.up();
}

test.describe('editor', () => {
  test.beforeEach(async ({ page }) => {
    await createFreshDiagram(page);
  });

  test('user adds nodes, edits a label, and persists the diagram', async ({
    page,
  }) => {
    await page.getByTestId('library-item-canvas-block').click();
    await page.getByTestId('library-item-canvas-text').click();

    const nodes = page.locator('[data-testid^="diagram-node-"]');
    await expect(nodes).toHaveCount(2);

    await dragNodeBy(page, nodes.nth(1), { x: 360, y: 180 });

    await clickDiagramNode(page, nodes.nth(0));
    await page.getByTestId('properties-node-label-input').fill('Kickoff');

    await page.getByTestId('diagram-name-input').fill('Updated Diagram');
    await page.getByTestId('manual-save-button').click();

    await page.getByTestId('back-to-dashboard').click();
    await expect(
      page
        .locator('[data-testid^="diagram-title-"]')
        .getByText('Updated Diagram'),
    ).toBeVisible();
  });

  test('user deletes a selected node with keyboard shortcut', async ({
    page,
  }) => {
    await page.getByTestId('library-item-canvas-note').click();
    const node = page.locator('[data-testid^="diagram-node-"]').first();

    await expect(node).toBeVisible();
    await node.getByRole('button').click();
    await page.keyboard.press('Backspace');

    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(0);
  });

  test('user groups selected nodes and can ungroup them', async ({ page }) => {
    await page.getByTestId('library-item-canvas-block').click();
    await page.getByTestId('library-item-canvas-text').click();

    const nodeLabels = page.locator('[data-testid^="diagram-node-"] button');
    await nodeLabels.nth(0).click();
    await page.keyboard.down('Shift');
    await nodeLabels.nth(1).click();
    await page.keyboard.up('Shift');

    await expect(page.getByTestId('selected-node-count')).toContainText('2');
    await page.getByTestId('group-selection-button').click();

    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(3);
    await page.getByTestId('ungroup-selection-button').click();
    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(2);
  });

  test('user performs undo and redo with keyboard shortcuts', async ({
    page,
  }) => {
    await page.getByTestId('library-item-canvas-block').click();
    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(1);

    await page.keyboard.press('ControlOrMeta+Z');
    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(0);

    await page.keyboard.press('ControlOrMeta+Shift+Z');
    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(1);
  });

  test('user can configure icon, tags, and background from the right panel', async ({
    page,
  }) => {
    await page.getByTestId('library-item-canvas-block').click();
    const blockNode = page.locator('[data-testid^="diagram-node-"]').first();
    await clickDiagramNode(page, blockNode);
    await page.getByTestId('properties-tab-style').click();
    await page.getByTestId('properties-node-icon-dropdown-trigger').click();
    await page.getByTestId('properties-node-icon-typography').click();
    await page.getByTestId('properties-tab-tags').click();
    await page.getByTestId('node-tag-input').fill('Important');
    await page.getByTestId('add-node-tag-button').click();
    await expect(page.getByTestId('node-tag-Important')).toBeVisible();
    await page.getByTestId('properties-tab-style').click();
    await page
      .getByTestId('properties-node-background-color-hex')
      .fill('#dbeafe');
  });

  test('user adds Circle and Architecture nodes', async ({ page }) => {
    await page.getByTestId('library-item-canvas-circle').click();
    await page.getByTestId('library-item-canvas-architecture').click();

    const nodes = page.locator('[data-testid^="diagram-node-"]');
    await expect(nodes).toHaveCount(2);
    await expect(nodes.first().getByText('Circle')).toBeVisible();
    await expect(nodes.nth(1).getByText('Service')).toBeVisible();
  });

  test('user resizes a node and state persists after reload', async ({
    page,
  }) => {
    await page.getByTestId('library-item-canvas-architecture').click();
    const node = page.locator('[data-testid^="diagram-node-"]').first();

    await resizeNodeBy(page, node, { x: 120, y: 80 });
    await expect(page.getByTestId('save-status-toolbar')).toContainText(
      'Saved',
      {
        timeout: 10000,
      },
    );
    await page.reload();
    await expect(page.getByTestId('react-flow-wrapper')).toBeVisible();
    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(1);
  });

  test('user uses node toolbar to duplicate and delete', async ({ page }) => {
    await page.getByTestId('library-item-canvas-counter').click();
    const node = page.locator('[data-testid^="diagram-node-"]').first();
    await clickDiagramNode(page, node);

    const nodeId = (await node.getAttribute('data-testid'))?.replace(
      'diagram-node-',
      '',
    );
    expect(nodeId).toBeTruthy();

    await page.getByTestId(`node-toolbar-duplicate-${nodeId}`).click();
    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(2);

    const firstNode = page.locator('[data-testid^="diagram-node-"]').first();
    await clickDiagramNode(page, firstNode);
    const firstId = (await firstNode.getAttribute('data-testid'))?.replace(
      'diagram-node-',
      '',
    );
    await page.getByTestId(`node-toolbar-delete-${firstId}`).click();
    await expect(page.locator('[data-testid^="diagram-node-"]')).toHaveCount(1);
  });
});
