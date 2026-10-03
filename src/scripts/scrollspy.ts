export function initScrollSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.lineage__item')];
  if (!links.length) return;
  // On narrow screens the nav is a horizontal scroller; keep the current item inside it.
  const reveal = (a: HTMLAnchorElement) => {
    const nav = a.parentElement;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const pad = 16;
    const left = a.offsetLeft - pad;
    const right = a.offsetLeft + a.offsetWidth + pad - nav.clientWidth;
    if (nav.scrollLeft > left || nav.scrollLeft < right) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      nav.scrollTo({ left: nav.scrollLeft > left ? left : right, behavior: smooth ? 'smooth' : 'auto' });
    }
  };
  const setActive = (id: string) => {
    for (const a of links) {
      const on = a.hash === `#${id}`;
      a.classList.toggle('is-active', on);
      if (on) {
        a.setAttribute('aria-current', 'true');
        reveal(a);
      } else a.removeAttribute('aria-current');
    }
  };
  const sections = links
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter((s): s is HTMLElement => s !== null);
  if (!sections.length) return;

  // Current = the last section whose top has passed 40% of the viewport.
  // At the very bottom of the page the last section wins, even if it is short.
  let queued = false;
  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.4;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections[sections.length - 1];
    setActive(current.id);
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
}
