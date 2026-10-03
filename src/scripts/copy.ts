export function initCopy(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.hidden = false;
    // The aria-label fixes the button's accessible name, so feedback goes through a live region.
    const status = btn.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
    let reset = 0;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy ?? '';
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied';
        if (status) status.textContent = 'Email address copied';
      } catch {
        const target = document.getElementById(btn.getAttribute('aria-controls') ?? '');
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
        btn.textContent = 'Press Ctrl+C';
        if (status) status.textContent = 'Email address selected. Press Ctrl+C to copy.';
      }
      window.clearTimeout(reset);
      reset = window.setTimeout(() => {
        btn.textContent = 'Copy';
        if (status) status.textContent = '';
      }, 2000);
    });
  });
}
