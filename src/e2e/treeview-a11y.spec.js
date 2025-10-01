// src/e2e/treeview-a11y.spec.js
import { test, expect } from '@playwright/test';

test('TreeView moves focus with Arrow keys', async ({ page }) => {
  await page.goto('/');

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

  // Give focus to the first item by clicking it (more reliable than Tab through the page chrome)
  await items.first().click();
  await expect(items.first()).toBeFocused();

  // ArrowDown should move focus to the second item
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(1)).toBeFocused();

  // ArrowRight should expand if collapsed (optional assertion if you set aria-expanded)
  // await expect(items.nth(1)).toHaveAttribute('aria-expanded', 'true');

  // ArrowUp should move focus back to the first item
  await page.keyboard.press('ArrowUp');
  await expect(items.first()).toBeFocused();

  // ArrowRight on first item should expand root (optional)
  // await page.keyboard.press('ArrowRight');
  // await expect(items.first()).toHaveAttribute('aria-expanded', 'true');
});
