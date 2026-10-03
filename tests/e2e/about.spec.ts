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

// Particles travel in straight lines between label centres, so the arrows must sit on that path and no caption may cross it.
for (const width of [360, 390, 768, 1280]) {
  test(`flow strip arrows follow the particle path at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const problems = await page.locator('[data-flow="strip"]').evaluate((strip) => {
      const box = (el: Element) => el.getBoundingClientRect();
      const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      const labels = [...strip.querySelectorAll('.flow__label')].map(box);
      const arrows = [...strip.querySelectorAll('.flow__arrow')].map(box);
      const captions = [...strip.querySelectorAll('.flow__caption')].map(box);
      const out: string[] = [];
      for (let i = 0; i < labels.length - 1; i++) {
        const a = centre(labels[i]);
        const b = centre(labels[i + 1]);
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const c = centre(arrows[i]);
        const t = ((c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y)) / (len * len);
        const off = Math.abs((b.x - a.x) * (a.y - c.y) - (a.x - c.x) * (b.y - a.y)) / len;
        if (t <= 0 || t >= 1 || off > 6) out.push(`arrow ${i + 1} is off the path (t=${t.toFixed(2)}, ${off.toFixed(0)}px away)`);
        for (let s = 0; s <= len; s += 2) {
          const x = a.x + ((b.x - a.x) * s) / len;
          const y = a.y + ((b.y - a.y) * s) / len;
          captions.forEach((r, k) => {
            if (x > r.left + 1 && x < r.right - 1 && y > r.top + 1 && y < r.bottom - 1) out.push(`path ${i + 1} crosses caption ${k + 1}`);
          });
        }
      }
      return [...new Set(out)];
    });
    expect(problems).toEqual([]);
  });
}
