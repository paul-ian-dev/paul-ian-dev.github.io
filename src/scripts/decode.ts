const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#%*';

export function decode(el: HTMLElement, text: string, durationMs = 650): void {
  const start = performance.now();
  const frame = (t: number) => {
    const p = Math.min(1, (t - start) / durationMs);
    const reveal = Math.floor(p * text.length);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      out += i < reveal || ch === ' ' || ch === '&' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function initDecode(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-decode]').forEach((el) => decode(el, el.dataset.decode ?? el.textContent ?? ''));
}
