export function formatMonth(ym: string): string {
  return /^\d{4}-\d{2}$/.test(ym) ? ym.replace('-', '.') : ym;
}

export function formatRange(start: string, end?: string | null): string {
  return `${formatMonth(start)} → ${end ? formatMonth(end) : 'now'}`;
}

/** Newest year first; the CMS order field breaks ties within a year. */
export function byYearDesc(a: { data: { year: number; order: number } }, b: { data: { year: number; order: number } }): number {
  return b.data.year - a.data.year || a.data.order - b.data.order;
}

export function byOrder(a: { data: { order: number } }, b: { data: { order: number } }): number {
  return a.data.order - b.data.order;
}

/** "Tetris (Java, Swing, 2024)": the first two stack items and the year, for the Earlier line. */
export function earlierLine({ title, stack, year }: { title: string; stack: string[]; year: number }): string {
  return `${title} (${[...stack.slice(0, 2), year].join(', ')})`;
}
