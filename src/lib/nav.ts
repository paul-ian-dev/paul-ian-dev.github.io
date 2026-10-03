export interface NavItem { id: string; label: string }

export function buildNav(counts: { experience: number; work: number; notes: number; credentials: number }): NavItem[] {
  const items: NavItem[] = [{ id: 'about', label: 'about' }];
  // The work section is labelled Projects; its id stays #work so existing links keep working.
  const labels = { experience: 'experience', work: 'projects', notes: 'notes', credentials: 'credentials' };
  for (const id of ['experience', 'work', 'notes', 'credentials'] as const) {
    if (counts[id] > 0) items.push({ id, label: labels[id] });
  }
  return items;
}
