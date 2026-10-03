import { describe, expect, it } from 'vitest';
import { contrast, dark, light, tokensCss } from '../../src/styles/tokens';

const textPairs = [
  ['fg', 'bg'], ['muted', 'bg'], ['faint', 'bg'], ['accent', 'bg'],
  ['fg', 'panel'], ['muted', 'panel'], ['faint', 'panel'], ['accent', 'panel'],
  ['onAccent', 'accent'],
] as const;

describe('design tokens', () => {
  for (const [name, theme] of [['dark', dark], ['light', light]] as const) {
    for (const [fg, bg] of textPairs) {
      it(`${name}: ${fg} on ${bg} meets WCAG AA 4.5:1`, () => {
        expect(contrast(theme[fg], theme[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('computes known contrast values', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrast('#8FD3F4', '#0E1719')).toBeCloseTo(11.07, 1);
  });

  it('emits dark tokens by default and light tokens under prefers-color-scheme', () => {
    const css = tokensCss();
    expect(css).toContain('--accent:#8FD3F4;');
    expect(css).toContain('--on-accent:#0E1719;');
    expect(css).toMatch(/@media \(prefers-color-scheme: light\)\{:root\{[^}]*--accent:#1C6590;/);
  });
});
