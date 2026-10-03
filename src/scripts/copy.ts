export function initCopy(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy ?? '';
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied';
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
      }
      window.setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });
}
