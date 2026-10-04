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

/**
 * Text marked [data-decode] scrambles and resolves left to right on load.
 * Each word is held at its real width while scrambled, so the line never re-wraps and nothing shifts.
 */
export async function initDecode(durationMs = 1400): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = [...document.querySelectorAll<HTMLElement>('[data-decode]')];
  if (!targets.length) return;
  // Measure in the final font, but don't hold the effect back for long.
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 600))]);

  for (const target of targets) {
    const original = target.textContent ?? '';
    const words: Array<{ el: HTMLSpanElement; text: string; offset: number }> = [];
    let offset = 0;
    target.textContent = '';
    for (const part of original.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) target.append(part);
      else {
        const el = document.createElement('span');
        el.textContent = part;
        target.append(el);
        words.push({ el, text: part, offset });
      }
      offset += part.length;
    }
    const widths = words.map((w) => w.el.getBoundingClientRect().width);
    words.forEach((w, i) => Object.assign(w.el.style, { display: 'inline-block', width: `${widths[i]}px`, whiteSpace: 'pre' }));

    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const revealed = Math.floor(p * original.length);
      for (const w of words) {
        let out = '';
        for (let i = 0; i < w.text.length; i++) out += w.offset + i < revealed ? w.text[i] : scramble(w.text[i]);
        w.el.textContent = out;
      }
      if (p < 1) requestAnimationFrame(frame);
      else target.textContent = original;
    };
    requestAnimationFrame(frame);
  }
}
