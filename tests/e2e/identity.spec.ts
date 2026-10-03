import { expect, test } from '@playwright/test';

test('identity column shows who Paul is and how to reach him', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Paul Ian Lim' })).toBeVisible();
  await expect(page.getByText('Software & Data Engineer').first()).toBeVisible();
  await expect(page.getByText('Hello · 你好 · Apa khabar · こんにちは · 안녕하세요')).toBeVisible();
  await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/paul-ian-au/');
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/paul-ian-dev');
  await expect(page.getByText('paul.iand3138@hotmail.com')).toBeVisible();
});

test('lineage nav shows real counts and marks the first section current', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Sections' });
  await expect(nav.getByRole('link', { name: /experience\s*3/ })).toBeVisible();
  await expect(nav.getByRole('link', { name: /work\s*3/ })).toBeVisible();
  await expect(nav.getByRole('link', { name: /credentials\s*9/ })).toBeVisible();
  await expect(nav.getByRole('link', { name: /notes/ })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'about' })).toHaveAttribute('aria-current', 'true');
});

test('CV button hidden when profile.cv is empty', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Download CV' })).toHaveCount(0);
});

test('skip link is first focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});

test('copy button copies the email', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy email address' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('paul.iand3138@hotmail.com');
});

for (const width of [360, 768, 1280]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('each greeting word stays on one line', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const lines = await page.locator('.identity__greeting [lang]').evaluateAll((els) => els.map((el) => el.getClientRects().length));
  expect(lines).toEqual([1, 1, 1, 1, 1]);
});
