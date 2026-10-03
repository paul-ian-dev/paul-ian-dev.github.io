const SETS: Array<[RegExp, string]> = [
  [/[a-z]/, 'abcdefghijklmnopqrstuvwxyz'],
  [/[A-Z]/, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  [/[0-9]/, '0123456789'],
];

/** Swap a character for a random one of the same kind, so scrambled text keeps roughly the same width. */
function scramble(ch: string): string {
  for (const [re, set] of SETS) if (re.test(ch)) return set[Math.floor(Math.random() * set.length)];
  return ch;
}

interface Job { node: Text; text: string; start: number; duration: number }

/** Every piece of text visible on first load scrambles and resolves, top to bottom. */
export function initDecode(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const vh = window.innerHeight;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = (node as Text).parentElement;
      if (!el || !(node as Text).data.trim()) return NodeFilter.FILTER_REJECT;
      if (el.closest('script, style, noscript, .visually-hidden, [aria-hidden="true"], .skip')) return NodeFilter.FILTER_REJECT;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < vh ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const jobs: Job[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text;
    const top = Math.max(0, node.parentElement!.getBoundingClientRect().top);
    jobs.push({ node, text: node.data, start: (top / vh) * 350, duration: Math.min(900, 300 + node.data.length * 6) });
  }
  if (!jobs.length) return;

  // Scrambled text wraps differently from the real text, which would push content around. Hold each text
  // block at its real size until decoding ends (measure everything first, then write, to avoid layout thrash).
  const boxes = new Set<HTMLElement>();
  for (const job of jobs) {
    let el: HTMLElement | null = job.node.parentElement;
    while (el && getComputedStyle(el).display === 'inline') el = el.parentElement;
    if (el) boxes.add(el);
  }
  const sizes = [...boxes].map((el) => {
    const r = el.getBoundingClientRect();
    // A box no taller than about one line of its text is a label or button: keep it on one line while scrambled.
    const oneLine = r.height < parseFloat(getComputedStyle(el).fontSize) * 2.4;
    return [el, r, oneLine] as const;
  });
  for (const [el, r, oneLine] of sizes) {
    el.style.height = `${r.height}px`;
    el.style.width = `${r.width}px`;
    if (oneLine) el.style.whiteSpace = 'nowrap';
  }
  const release = () => {
    for (const [el] of sizes) {
      el.style.removeProperty('height');
      el.style.removeProperty('width');
      el.style.removeProperty('white-space');
    }
  };

  const t0 = performance.now();
  const frame = (now: number) => {
    let running = false;
    for (const job of jobs) {
      const p = Math.min(1, Math.max(0, (now - t0 - job.start) / job.duration));
      if (p >= 1) {
        if (job.node.data !== job.text) job.node.data = job.text;
        continue;
      }
      running = true;
      const reveal = Math.floor(p * job.text.length);
      let out = job.text.slice(0, reveal);
      for (let i = reveal; i < job.text.length; i++) out += scramble(job.text[i]);
      job.node.data = out;
    }
    if (running) requestAnimationFrame(frame);
    else release();
  };
  requestAnimationFrame(frame);
}
