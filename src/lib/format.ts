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

/** "(Java, Swing, 2024)": the first two stack items and the year, shown after an earlier project's name. */
export function earlierMeta({ stack, year }: { stack: string[]; year: number }): string {
  return `(${[...stack.slice(0, 2), year].join(', ')})`;
}
