import { test, expect } from '@playwright/test';
import { generateHTML } from '../utils/generateHTML.js';

test('exported HTML renders and collapses/expands', async ({ page }) => {
  const tree = [
    { id: 'n-0', name: 'Root', children: [
      { id: 'n-1', name: 'Child 1', children: [] },
      { id: 'n-2', name: 'Child 2', children: [
        { id: 'n-3', name: 'Grandchild', children: [] }
      ]}
    ]}
  ];
  const html = generateHTML(tree);
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  // Buttons exist
  const expandAll = page.getByRole('button', { name: /expand all/i });
  const collapseAll = page.getByRole('button', { name: /collapse all/i });
  await expect(expandAll).toBeVisible();
  await expect(collapseAll).toBeVisible();

  // Initially, children are visible
  await expect(page.getByText('Child 1')).toBeVisible();
  await expect(page.getByText('Child 2')).toBeVisible();

  // Collapse all hides grandchildren text
  await collapseAll.click();
  await expect(page.getByText('Grandchild')).not.toBeVisible();

  // Expand all shows them again
  await expandAll.click();
  await expect(page.getByText('Grandchild')).toBeVisible();
});
