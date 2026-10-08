const { test, expect } = require('@playwright/test');

test('ParaBank application is accessible', async ({ page }) => {
  await page.goto('/parabank/index.htm');

  await expect(page).toHaveTitle(/ParaBank/);
});