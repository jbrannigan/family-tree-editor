import { test, expect } from '@playwright/test';

test('TreeView moves focus with Arrow keys', async ({ page }) => {
  await page.goto('/');
  // Focus the tree (Tab to the first treeitem)
  await page.keyboard.press('Tab');
  // Ensure a treeitem is focused
  const active = page.locator('[role="treeitem"]').first();
  await expect(active).toBeFocused();

  // ArrowDown should move focus
  await page.keyboard.press('ArrowDown');
  const second = page.locator('[role="treeitem"]').nth(1);
  await expect(second).toBeFocused();
});
