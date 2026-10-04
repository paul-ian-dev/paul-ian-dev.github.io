const canGlow = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The page's dot grid (.backdrop) glows around the pointer, anywhere on the page. */
export function initGlow(): void {
  const backdrop = document.querySelector<HTMLElement>('.backdrop');
  if (!backdrop || !canGlow()) return;
  // The backdrop is fixed to the window, so pointer coordinates map straight onto it.
  window.addEventListener('pointermove', (e) => {
    backdrop.style.setProperty('--mx', `${e.clientX}px`);
    backdrop.style.setProperty('--my', `${e.clientY}px`);
    backdrop.style.setProperty('--glow', '0.8');
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => backdrop.style.setProperty('--glow', '0'));
}
