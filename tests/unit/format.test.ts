import { describe, expect, it } from 'vitest';
import { byOrder, formatMonth, formatRange } from '../../src/lib/format';

describe('formatMonth', () => {
  it('turns YYYY-MM into YYYY.MM', () => expect(formatMonth('2025-02')).toBe('2025.02'));
  it('passes placeholders through unchanged', () => expect(formatMonth('[start]')).toBe('[start]'));
});

describe('formatRange', () => {
  it('formats a closed range', () => expect(formatRange('2025-02', '2025-06')).toBe('2025.02 → 2025.06'));
  it('uses "now" for an open range', () => expect(formatRange('2026-01', null)).toBe('2026.01 → now'));
  it('uses "now" when end is missing', () => expect(formatRange('2026-01')).toBe('2026.01 → now'));
  it('never prints NaN for placeholders', () => expect(formatRange('[start]', '[end]')).toBe('[start] → [end]'));
});

describe('byOrder', () => {
  it('sorts ascending by data.order', () => {
    const items = [{ data: { order: 3 } }, { data: { order: 1 } }, { data: { order: 2 } }];
    expect(items.sort(byOrder).map((i) => i.data.order)).toEqual([1, 2, 3]);
  });
});
