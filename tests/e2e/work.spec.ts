import { expect, test } from '@playwright/test';

test('work section lists featured projects with flow lines', async ({ page }) => {
  await page.goto('/');
  const work = page.locator('#work');
  await expect(work.locator('.card__title')).toHaveText(['ANZSB website rebuild', 'Four client websites in 2.5 months', 'Imaginex']);
  await expect(work.locator('.card__flow').first()).toHaveText('Design ──▶ WordPress ──▶ CiviCRM · 2025');
  await expect(work).toContainText('Earlier');
  await expect(work).toContainText('Tetris');
});

test('no broken images', async ({ page }) => {
  await page.goto('/');
  const broken = await page.evaluate(() =>
    [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src));
  expect(broken).toEqual([]);
});

test('case study page renders for a project with a body', async ({ page }) => {
  await page.goto('/work/anzsb/');
  await expect(page.getByRole('heading', { level: 1, name: 'ANZSB website rebuild' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Visit live site/ })).toHaveAttribute('href', 'https://anzsb.asn.au');
  await expect(page.getByRole('link', { name: /Back to all work/ })).toHaveAttribute('href', '/#work');
});

test('projects without a body do not get a page', async ({ request }) => {
  expect((await request.get('/work/imaginex/')).status()).toBe(404);
});
