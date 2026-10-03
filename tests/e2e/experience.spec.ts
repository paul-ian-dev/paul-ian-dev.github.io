import { expect, test } from '@playwright/test';

test('engineering tab is selected by default and lists three roles newest first', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Engineering' })).toHaveAttribute('aria-selected', 'true');
  const panel = page.getByRole('tabpanel', { name: 'Engineering' });
  await expect(panel.locator('.xp__title')).toHaveText([
    'Backend Developer · Marketing Decisions',
    'Website Developer · PRECISE',
    'Website Developer · Zoewebs',
  ]);
  await expect(panel.locator('.xp__dates').first()).toHaveText('2026.01 → now');
  await expect(page.getByRole('tabpanel', { name: 'Other work' })).toBeHidden();
});

test('tabs switch by click and by arrow keys', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Other work' }).click();
  const other = page.getByRole('tabpanel', { name: 'Other work' });
  await expect(other).toContainText('KooKoo Teppanyaki & Lounge Bar');
  await expect(other).toContainText('2023.12 → 2026.01');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Engineering' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Engineering' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Other work' })).toHaveAttribute('aria-selected', 'true');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('both lists are visible under headings', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Engineering' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Other work' })).toBeVisible();
    await expect(page.getByText("Hungry Jack's")).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(0);
  });
});

test('role titles have no default heading margins', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xp__title').first()).toHaveCSS('margin-top', '0px');
  await expect(page.locator('.xp__title').first()).toHaveCSS('margin-bottom', '0px');
});

const headingLevels = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter((h) => h.checkVisibility())
      .map((h) => Number(h.tagName[1])),
  );

test('heading levels never skip', async ({ page }) => {
  await page.goto('/');
  const levels = await headingLevels(page);
  levels.forEach((level, i) => expect(level - (levels[i - 1] ?? 0), `heading ${i + 1}: h${levels[i - 1]} → h${level}`).toBeLessThanOrEqual(1));
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('heading levels never skip', async ({ page }) => {
    await page.goto('/');
    const levels = await headingLevels(page);
    levels.forEach((level, i) => expect(level - (levels[i - 1] ?? 0), `heading ${i + 1}`).toBeLessThanOrEqual(1));
  });
});
