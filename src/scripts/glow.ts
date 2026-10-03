const canGlow = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** [data-glow="0.8"]: the element's dot grid glows around the pointer. */
export function initGlow(): void {
  if (!canGlow()) return;
  document.querySelectorAll<HTMLElement>('[data-glow]').forEach((el) => {
    const strength = el.dataset.glow || '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      el.style.setProperty('--glow', strength);
    });
    el.addEventListener('pointerleave', () => el.style.setProperty('--glow', '0'));
  });
}
