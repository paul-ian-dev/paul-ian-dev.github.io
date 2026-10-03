import { describe, expect, it } from 'vitest';
import { findPlaceholders } from '../../scripts/placeholders.mjs';

describe('findPlaceholders', () => {
  it('finds bracketed placeholders anywhere in nested data', () => {
    const found = findPlaceholders({ a: '[start]', b: [{ c: 'ok' }, { d: 'see [Screenshot · x]' }] });
    expect(found).toEqual([
      { path: 'a', text: '[start]' },
      { path: 'b.1.d', text: '[Screenshot · x]' },
    ]);
  });

  it('ignores Markdown links', () => {
    expect(findPlaceholders({ body: 'See [the site](https://anzsb.asn.au).' })).toEqual([]);
  });
});
