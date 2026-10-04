export interface NavItem { id: string; label: string }

type Counts = { experience: number; work: number; notes: number; education: number; awards: number };

export function buildNav(counts: Counts): NavItem[] {
  const items: NavItem[] = [{ id: 'about', label: 'about' }];
  // The work section is labelled Projects; its id stays #work so existing links keep working.
  const labels: Record<keyof Counts, string> = { experience: 'experience', work: 'projects', notes: 'notes', education: 'education', awards: 'awards' };
  for (const id of ['experience', 'work', 'notes', 'education', 'awards'] as const) {
    if (counts[id] > 0) items.push({ id, label: labels[id] });
  }
  return items;
}
