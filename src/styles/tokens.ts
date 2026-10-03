export const dark = {
  bg: '#0E1719', panel: '#111D20', fg: '#E4ECEA', muted: '#9FB2AF', faint: '#7E9491',
  line: '#243A3E', raw: '#6F8784', accent: '#8FD3F4', onAccent: '#0E1719',
} as const;

export const light = {
  bg: '#F4F7F6', panel: '#FFFFFF', fg: '#10201F', muted: '#43524F', faint: '#5B6B68',
  line: '#D3DCD9', raw: '#8A9A97', accent: '#1C6590', onAccent: '#FFFFFF',
} as const;

type Theme = Record<keyof typeof dark, string>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const vars = (t: Theme) => Object.entries(t).map(([k, v]) => `--${kebab(k)}:${v};`).join('');

export function tokensCss(): string {
  return `:root{${vars(dark)}color-scheme:dark}@media (prefers-color-scheme: light){:root{${vars(light)}color-scheme:light}}`;
}
