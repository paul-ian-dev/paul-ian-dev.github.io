import { expect, test } from '@playwright/test';

test('headline decodes to the real text, with a hidden copy for screen readers', async ({ page }) => {
  await page.goto('/');
  const shown = page.locator('[data-decode]');
  await expect(shown).toHaveAttribute('aria-hidden', 'true');
  await expect(shown).toHaveText('Software & Data Engineer', { timeout: 2000 });
  await expect(page.locator('.identity__headline .visually-hidden')).toHaveText('Software & Data Engineer');
});

test('dot-grid glow follows a mouse over the identity column', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const box = (await page.locator('.identity').boundingBox())!;
  await page.mouse.move(box.x + 120, box.y + 300);
  await expect(page.locator('.identity')).toHaveCSS('--glow', '0.8');
});

test('timeline fill is scroll-driven where supported', async ({ page }) => {
  await page.goto('/');
  const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
  const name = await page.locator('.timeline__fill').evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe(supported ? 'timeline-fill' : 'none');
});

test('card and case study share view-transition names', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#work .card__title').first()).toHaveCSS('view-transition-name', 'title-anzsb');
  await page.goto('/work/anzsb/');
  await expect(page.locator('.case__title')).toHaveCSS('view-transition-name', 'title-anzsb');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no glow, no decode, timeline finished', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.locator('[data-decode]')).toHaveText('Software & Data Engineer');
    const box = (await page.locator('.identity').boundingBox())!;
    await page.mouse.move(box.x + 120, box.y + 300);
    expect(await page.locator('.identity').evaluate((el) => el.style.getPropertyValue('--glow'))).toBe('');
    const name = await page.locator('.timeline__fill').evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('none');
  });
});
