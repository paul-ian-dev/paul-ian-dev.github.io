export type Segment = string | { text: string; href: string };

const LINK = /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g;

/** Splits CMS text into plain strings and [text](https://…) links. Anything else stays literal text. */
export function parseLinks(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
