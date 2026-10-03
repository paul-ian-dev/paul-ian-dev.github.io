const canGlow = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function track(el: HTMLElement, e: PointerEvent, strength: string): void {
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
  el.style.setProperty('--glow', strength);
}

/** [data-glow="0.8"]: the element glows around the pointer. [data-glow-group]: every [data-glow-item] inside glows. */
export function initGlow(): void {
  if (!canGlow()) return;
  document.querySelectorAll<HTMLElement>('[data-glow]').forEach((el) => {
    const strength = el.dataset.glow || '1';
    el.addEventListener('pointermove', (e) => track(el, e, strength));
    el.addEventListener('pointerleave', () => el.style.setProperty('--glow', '0'));
  });
  document.querySelectorAll<HTMLElement>('[data-glow-group]').forEach((group) => {
    const items = [...group.querySelectorAll<HTMLElement>('[data-glow-item]')];
    group.addEventListener('pointermove', (e) => items.forEach((it) => track(it, e, '1')));
    group.addEventListener('pointerleave', () => items.forEach((it) => it.style.setProperty('--glow', '0')));
  });
}
