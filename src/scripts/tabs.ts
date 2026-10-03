export function initTabs(): void {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const list = root.querySelector<HTMLElement>('[data-tablist]');
    if (!list) return;
    const tabs = [...list.querySelectorAll<HTMLButtonElement>('[data-tab]')];
    const panels = tabs.map((t) => document.getElementById(t.dataset.tab ?? '')!);

    list.hidden = false;
    list.setAttribute('role', 'tablist');
    root.classList.add('is-enhanced');
    tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[i].id);
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', tab.id);
      panels[i].tabIndex = 0;
    });

    const select = (index: number, focus: boolean) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        const next = ({ ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last } as Record<string, number>)[e.key];
        if (next === undefined) return;
        e.preventDefault();
        select(next, true);
      });
    });
    select(0, false);
  });
}
