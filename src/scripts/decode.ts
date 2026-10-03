const SETS: Array<[RegExp, string]> = [
  [/[a-z]/, 'abcdefghijklmnopqrstuvwxyz'],
  [/[A-Z]/, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  [/[0-9]/, '0123456789'],
];

/** Swap a character for a random one of the same kind; anything else (spaces, punctuation, CJK) stays put. */
function scramble(ch: string): string {
  for (const [re, set] of SETS) if (re.test(ch)) return set[Math.floor(Math.random() * set.length)];
  return ch;
}

interface Word { el: HTMLSpanElement; text: string; start: number; duration: number }

const visibleTextNodes = (vh: number): Text[] => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = (node as Text).parentElement;
      if (!el || !(node as Text).data.trim()) return NodeFilter.FILTER_REJECT;
      if (el.closest('script, style, noscript, .visually-hidden, [aria-hidden="true"], .skip')) return NodeFilter.FILTER_REJECT;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < vh ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const out: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n as Text);
  return out;
};

/**
 * Every piece of text visible on first load scrambles and resolves, top to bottom.
 * Each word is held at its real width while scrambled, so no line ever re-wraps and nothing shifts.
 */
export async function initDecode(): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Measure in the final font, but don't hold the effect back for long.
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 600))]);

  const vh = window.innerHeight;
  const nodes = visibleTextNodes(vh);
  if (!nodes.length) return;

  // Write pass: split each text node into word spans (whitespace and break points after hyphens stay as they were).
  const restore: Array<[HTMLSpanElement, Text]> = [];
  const words: Word[] = [];
  for (const node of nodes) {
    const host = document.createElement('span');
    for (const part of node.data.split(/(\s+|(?<=-))/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { host.append(part); continue; }
      const el = document.createElement('span');
      el.textContent = part;
      host.append(el);
      words.push({ el, text: part, start: 0, duration: 0 });
    }
    node.replaceWith(host);
    restore.push([host, node]);
  }
  // Read pass: real widths and positions. Then fix each word to its width.
  const rects = words.map((w) => w.el.getBoundingClientRect());
  words.forEach((w, i) => {
    w.el.style.display = 'inline-block';
    w.el.style.width = `${rects[i].width}px`;
    w.el.style.whiteSpace = 'pre';
    w.start = (Math.max(0, rects[i].top) / vh) * 350;
    w.duration = 300 + Math.random() * 350;
  });

  const t0 = performance.now();
  const frame = (now: number) => {
    let running = false;
    for (const w of words) {
      const p = Math.min(1, Math.max(0, (now - t0 - w.start) / w.duration));
      if (p < 1) running = true;
      const reveal = Math.floor(p * w.text.length);
      let out = w.text.slice(0, reveal);
      for (let i = reveal; i < w.text.length; i++) out += scramble(w.text[i]);
      if (w.el.textContent !== out) w.el.textContent = out;
    }
    if (running) requestAnimationFrame(frame);
    else for (const [host, node] of restore) host.replaceWith(node);
  };
  requestAnimationFrame(frame);
}
