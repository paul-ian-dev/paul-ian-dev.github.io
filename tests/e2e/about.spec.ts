import { expect, test } from '@playwright/test';

test('flow strip shows ELT steps with captions', async ({ page }) => {
  await page.goto('/');
  const strip = page.locator('[data-flow="strip"]');
  await expect(strip.locator('.flow__label')).toHaveText(['Sources', 'Snowflake', 'Models', 'Apps & APIs']);
  await expect(strip.locator('.flow__caption')).toHaveText(['extract', 'load & transform', 'predict', 'serve']);
  await expect(strip).toHaveAttribute('data-change-index', '1');
});

test('about text is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about')).toContainText('Bachelor of Computer Science with Distinction');
});

test('long text does not overflow at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.evaluate(() => {
    const p = document.querySelector('#about p');
    if (p) p.textContent = 'https://example.com/' + 'a'.repeat(80);
    const h = document.querySelector('.identity__name');
    if (h) h.textContent = 'Supercalifragilisticexpialidocious-Engineering-Consultancy';
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
