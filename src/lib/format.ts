export function formatMonth(ym: string): string {
  return /^\d{4}-\d{2}$/.test(ym) ? ym.replace('-', '.') : ym;
}

export function formatRange(start: string, end?: string | null): string {
  return `${formatMonth(start)} → ${end ? formatMonth(end) : 'now'}`;
}

export function byOrder(a: { data: { order: number } }, b: { data: { order: number } }): number {
  return a.data.order - b.data.order;
}

/** "Tetris (Java, Swing, 2024)": the first two stack items and the year, for the Earlier line. */
export function earlierLine({ title, stack, year }: { title: string; stack: string[]; year: number }): string {
  return `${title} (${[...stack.slice(0, 2), year].join(', ')})`;
}
