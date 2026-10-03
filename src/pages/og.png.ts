import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { dark } from '../styles/tokens';

const font = (weight: 400 | 800) => readFile(`node_modules/@fontsource/chivo/files/chivo-latin-${weight}-normal.woff`);

export const GET: APIRoute = async () => {
  const entry = await getEntry('profile', 'profile');
  if (!entry) throw new Error('src/content/profile/profile.yaml is missing');
  const { name, headline, pitch, whatIBuild } = entry.data;

  const node = (text: string, hub: boolean) => ({
    type: 'div',
    props: {
      style: { padding: '10px 16px', borderRadius: 8, border: `2px solid ${hub ? dark.accent : dark.line}`, color: hub ? dark.accent : dark.fg, fontSize: 24 },
      children: text,
    },
  });
  const flow = whatIBuild.flatMap((s, i) => [
    // A drawn connector: Chivo's latin subset has no arrow glyph, so '→' would render as a missing-glyph box.
    ...(i > 0 ? [{ type: 'div', props: { style: { width: 28, height: 2, background: dark.faint } } }] : []),
    node(s.label, s.hub),
  ]);

  const tree = {
    type: 'div',
    props: {
      style: { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: 80, background: dark.bg, color: dark.fg, fontFamily: 'Chivo' },
      children: [
        { type: 'div', props: { style: { fontSize: 88, fontWeight: 800, letterSpacing: -2.5 }, children: name } },
        { type: 'div', props: { style: { fontSize: 38, color: dark.accent }, children: headline } },
        { type: 'div', props: { style: { fontSize: 28, color: dark.muted, maxWidth: 900 }, children: pitch } },
        { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }, children: flow } },
      ],
    },
  };

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Chivo', data: await font(400), weight: 400, style: 'normal' },
      { name: 'Chivo', data: await font(800), weight: 800, style: 'normal' },
    ],
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
