export function formatMonth(ym: string): string {
  return /^\d{4}-\d{2}$/.test(ym) ? ym.replace('-', '.') : ym;
}

export function formatRange(start: string, end?: string | null): string {
  return `${formatMonth(start)} → ${end ? formatMonth(end) : 'now'}`;
}

export function byOrder(a: { data: { order: number } }, b: { data: { order: number } }): number {
  return a.data.order - b.data.order;
}
