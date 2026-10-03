import { expect, test } from '@playwright/test';

test('home page renders with the right title and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveTitle('Paul Ian Lim · Software & Data Engineer');
  await expect(page.getByRole('heading', { level: 1, name: 'Paul Ian Lim' })).toBeVisible();
  expect(errors).toEqual([]);
});
