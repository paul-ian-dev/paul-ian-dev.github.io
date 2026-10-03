export interface FlowOptions {
  count: number;
  speed: number;
  spread: number;
  alpha: number;
  /** Index of the node after which particles switch from raw to accent colour; null = always accent. */
  changeIndex: number | null;
  /** Optional selector inside each node used as the path anchor (e.g. the nav dot). */
  anchor?: string;
}

interface Particle { d: number; v: number; off: number; ph: number; r: number }
interface Seg { ax: number; ay: number; dx: number; dy: number; len: number; start: number }

export function startFlow(wrap: HTMLElement, nodeSelector: string, opts: FlowOptions): { stop(): void } {
  const canvas = document.createElement('canvas');
  canvas.className = 'flow-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return { stop: () => canvas.remove() };

  const colour = { raw: '', accent: '' };
  const readColours = () => {
    const css = getComputedStyle(document.documentElement);
    colour.raw = css.getPropertyValue('--raw').trim();
    colour.accent = css.getPropertyValue('--accent').trim();
  };
  readColours();
  window.addEventListener('themechange', readColours);
  const parts: Particle[] = Array.from({ length: opts.count }, () => ({
    d: Math.random(), v: opts.speed * (0.6 + Math.random() * 0.8), off: (Math.random() - 0.5) * opts.spread,
    ph: Math.random() * Math.PI * 2, r: 1.1 + Math.random() * 1.2,
  }));
  let segs: Seg[] = [];
  let total = 0;
  let changeAt = Infinity;
  let visible = true;
  let raf = 0;
  let last = 0;

  const at = (d: number) => {
    for (let k = 0; k < segs.length; k++) {
      const s = segs[k];
      if (d <= s.start + s.len || k === segs.length - 1) {
        const t = s.len ? (d - s.start) / s.len : 0;
        return { x: s.ax + s.dx * t, y: s.ay + s.dy * t, nx: s.len ? -s.dy / s.len : 0, ny: s.len ? s.dx / s.len : 0 };
      }
    }
    return { x: 0, y: 0, nx: 0, ny: 0 };
  };

  const draw = (dt: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!segs.length) return;
    for (const p of parts) {
      p.d = (p.d + p.v * dt) % 1;
      const dist = p.d * total;
      const q = at(dist);
      const wob = p.off * Math.sin(p.ph + dist * 0.04);
      ctx.globalAlpha = Math.min(1, Math.min(p.d, 1 - p.d) * 12) * opts.alpha;
      ctx.fillStyle = opts.changeIndex === null || dist > changeAt ? colour.accent : colour.raw;
      ctx.beginPath();
      ctx.arc(q.x + q.nx * wob, q.y + q.ny * wob, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const layout = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pts = [...wrap.querySelectorAll<HTMLElement>(nodeSelector)].map((el) => {
      const target = (opts.anchor && el.querySelector<HTMLElement>(opts.anchor)) || el;
      const r = target.getBoundingClientRect();
      return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
    });
    segs = [];
    total = 0;
    changeAt = Infinity;
    for (let k = 0; k < pts.length - 1; k++) {
      const dx = pts[k + 1].x - pts[k].x;
      const dy = pts[k + 1].y - pts[k].y;
      const len = Math.hypot(dx, dy);
      segs.push({ ax: pts[k].x, ay: pts[k].y, dx, dy, len, start: total });
      if (opts.changeIndex === k + 1) changeAt = total + len;
      total += len;
    }
    draw(0);
  };

  const loop = (t: number) => {
    raf = 0;
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    draw(dt);
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    else last = 0;
  };
  const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); };

  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  const io = new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; wake(); });
  io.observe(wrap);
  document.addEventListener('visibilitychange', wake);
  document.fonts?.ready.then(layout);
  layout();
  wake();

  return {
    stop() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('themechange', readColours);
      canvas.remove();
    },
  };
}

export function initParticles(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const strip = document.querySelector<HTMLElement>('[data-flow="strip"]');
  // The strip is hidden on phones; don't run an animation nobody can see.
  if (strip && strip.offsetParent !== null) {
    startFlow(strip, '.flow__label', { count: 70, speed: 0.09, spread: 14, alpha: 0.95, changeIndex: Number(strip.dataset.changeIndex ?? 1) });
  }
}
