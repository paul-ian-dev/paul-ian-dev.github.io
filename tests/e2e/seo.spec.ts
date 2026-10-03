import { expect, test } from '@playwright/test';

test('head has description, canonical, OG and JSON-LD', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /data pipelines/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://paul-ian-dev.github.io/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://paul-ian-dev.github.io/og.png');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(ld['@type']).toBe('Person');
  expect(ld.sameAs).toContain('https://github.com/paul-ian-dev');
});

test('og.png, robots.txt and sitemap exist', async ({ request }) => {
  const og = await request.get('/og.png');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');
  expect((await og.body()).length).toBeGreaterThan(5_000);
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://paul-ian-dev.github.io/sitemap-index.xml');
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
});

test('render-blocking CSS on the home page stays small', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll((els) => els.map((el) => (el as HTMLLinkElement).href));
  let bytes = 0;
  for (const href of hrefs) bytes += (await (await request.get(href)).body()).length;
  // Bundling CJK web fonts for the greeting once pushed this past 300 KB and cost ~2 s of mobile first paint.
  expect(bytes).toBeLessThan(60_000);
});
