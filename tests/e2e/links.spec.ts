import { expect, test } from '@playwright/test';

const pages = ['/', '/notes/', '/work/anzsb/', '/work/zoewebs-client-sites/'];

for (const path of pages) {
  test(`every internal link on ${path} resolves`, async ({ page, request }) => {
    await page.goto(path);
    const hrefs = await page.locator('a[href^="/"], a[href^="#"]').evaluateAll((as) =>
      [...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''))]);
    for (const href of hrefs) {
      if (href.startsWith('#')) {
        if (href !== '#main') expect(await page.locator(href).count(), href).toBe(1);
        continue;
      }
      const url = href.split('#')[0];
      expect((await request.get(url)).status(), href).toBe(200);
    }
  });
}
