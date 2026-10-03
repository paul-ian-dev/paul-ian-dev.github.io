import { describe, expect, it } from 'vitest';
import { buildNav } from '../../src/lib/nav';

describe('buildNav', () => {
  it('lists sections in page order with real counts', () => {
    expect(buildNav({ experience: 3, work: 3, notes: 2, credentials: 9 })).toEqual([
      { id: 'about', label: 'about' },
      { id: 'experience', label: 'experience', count: 3 },
      { id: 'work', label: 'work', count: 3 },
      { id: 'notes', label: 'notes', count: 2 },
      { id: 'credentials', label: 'credentials', count: 9 },
    ]);
  });

  it('drops sections with nothing in them', () => {
    const ids = buildNav({ experience: 3, work: 0, notes: 0, credentials: 9 }).map((n) => n.id);
    expect(ids).toEqual(['about', 'experience', 'credentials']);
  });
});
