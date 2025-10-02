// src/e2e/treeview-a11y.spec.js
import { test, expect } from '@playwright/test';

test('TreeView moves focus with Arrow keys', async ({ page }) => {
  await page.goto('/');

  // Close the User Guide modal if it's showing (shown on first load)
  const getStartedButton = page.getByRole('button', { name: 'Get Started' });
  if (await getStartedButton.isVisible().catch(() => false)) {
    await getStartedButton.click();
  }

  // Seed the editor so the TreeView actually renders items.
  const sample = ['Root', '\tChild A', '\tChild B', '\t\tGrandchild B1'].join('\n');

  // Fill the editor (fallback chain tries a labeled textbox, then any textarea)
  const editor = page
    .getByRole('textbox', { name: /tree text editor/i }) // if you set aria-label
    .or(page.locator('textarea'));
  await editor.fill(sample);

  // Switch to List tab
  await page.getByRole('button', { name: 'List' }).click();

  // Wait for at least one treeitem to appear
  const items = page.getByRole('treeitem');
  await expect(items.first()).toBeVisible();

  // Give focus to the tree container (roving tabindex pattern)
  await items.first().click();
  await expect(items.first()).toHaveAttribute('aria-selected', 'true');

  // ArrowDown should move selection to the second item (using aria-selected)
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(items.first()).toHaveAttribute('aria-selected', 'false');

  // ArrowUp should move selection back to the first item
  await page.keyboard.press('ArrowUp');
  await expect(items.first()).toHaveAttribute('aria-selected', 'true');
  await expect(items.nth(1)).toHaveAttribute('aria-selected', 'false');
});
