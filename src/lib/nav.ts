export interface NavItem { id: string; label: string; count?: number }

export function buildNav(counts: { experience: number; work: number; notes: number; credentials: number }): NavItem[] {
  const items: NavItem[] = [{ id: 'about', label: 'about' }];
  for (const id of ['experience', 'work', 'notes', 'credentials'] as const) {
    if (counts[id] > 0) items.push({ id, label: id, count: counts[id] });
  }
  return items;
}
