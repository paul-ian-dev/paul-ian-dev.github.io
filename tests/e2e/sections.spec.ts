import { expect, test } from '@playwright/test';

test('stack shows three tiers', async ({ page }) => {
  await page.goto('/');
  const stack = page.locator('#stack');
  await expect(stack.locator('dt')).toHaveText(['At work', 'In projects', 'Learning']);
  await expect(stack).toContainText('Snowflake');
  await expect(stack).toContainText('Databricks');
});

test('credentials list all entries in order', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('#credentials .cred__name');
  await expect(items).toHaveCount(9);
  await expect(items.first()).toHaveText('Bachelor of Computer Science with Distinction');
});

test('notes section is hidden when there are no notes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#notes')).toHaveCount(0);
});

test('notes index page exists and handles zero notes', async ({ page }) => {
  await page.goto('/notes/');
  await expect(page.getByRole('heading', { level: 1, name: 'Notes' })).toBeVisible();
  await expect(page.getByText('No notes yet.')).toBeVisible();
});

test('footer shows a build log line with a real date', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.buildlog')).toHaveText(/last updated \d{4}-\d{2}-\d{2} · built with Astro · content in Git · hosted on GitHub Pages/);
});

test('404 page uses the site style and links home', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /Back to the home page/ })).toHaveAttribute('href', '/');
});
