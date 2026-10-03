export function initScrollSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.lineage__item')];
  if (!links.length) return;
  const setActive = (id: string) => {
    for (const a of links) {
      const on = a.hash === `#${id}`;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
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
