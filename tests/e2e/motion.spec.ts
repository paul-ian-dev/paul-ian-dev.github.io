import { expect, test } from '@playwright/test';

test('particles canvases are created on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('[data-flow="strip"] canvas.flow-canvas')).toHaveCount(1);
  await expect(page.locator('[data-flow="lineage"] canvas.flow-canvas')).toHaveCount(1);
  await expect(page.locator('canvas.flow-canvas').first()).toHaveAttribute('aria-hidden', 'true');
});

test('only the strip gets particles on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('[data-flow="strip"] canvas.flow-canvas')).toHaveCount(1);
  await expect(page.locator('[data-flow="lineage"] canvas.flow-canvas')).toHaveCount(0);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no particles canvas is created', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas.flow-canvas')).toHaveCount(0);
  });
});

test('scroll-spy moves the current node, including to the last section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.getElementById('work')!.offsetTop - 100));
  await expect(page.locator('.lineage__item[href="#work"]')).toHaveAttribute('aria-current', 'true');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('.lineage__item[href="#credentials"]')).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.lineage__item[href="#about"]')).not.toHaveAttribute('aria-current', 'true');
});
