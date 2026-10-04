export interface GraphNode {
  label: string;
  text: string;
  step?: number;
  hub?: boolean;
  kind?: 'end' | 'band';
}
export interface GraphData {
  nodes: Record<string, GraphNode>;
  edges: Array<[string, string]>;
  /** Nodes whose outgoing edges carry raw (grey) data; everything after them is accent. */
  raw: string[];
}

const NS = 'http://www.w3.org/2000/svg';
function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent?.appendChild(e);
  return e;
}

interface Pos { x: number; y: number }
interface Edge { a: string; b: string; path: SVGPathElement; len: number }

/** Wide layout: [column, row] per node. Phones use the hand-placed vertical layout below. */
const GRID: Record<string, [number, number]> = {
  feeds: [0, 0], apis: [0, 1], files: [0, 2], ingest: [1, 1], transform: [2, 1], models: [3, 1], semantic: [4, 1],
  apps: [5, 0.5], activate: [5, 1.5], appsOut: [6, 0], reports: [6, 1], platforms: [6, 2],
};

/** Draws the pipeline as an SVG graph inside `root`, with tooltips and particles along the edges. */
export function initPipelineGraph(root: HTMLElement, data: GraphData): void {
  const svg = el('svg', { role: 'group', 'aria-label': 'Pipeline graph' });
  const tip = document.createElement('div');
  tip.className = 'graph__tip';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  root.append(svg, tip);
  root.classList.add('is-drawn');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rawSet = new Set(data.raw);
  let edges: Edge[] = [];
  let particles: Array<{ edge: Edge; c: SVGCircleElement; t: number; v: number }> = [];
  let active: string | null = null;
  let vertical = root.clientWidth < 760;

  const layout = () => {
    vertical = root.clientWidth < 760;
    const W = vertical ? 360 : 1180, nodeW = vertical ? 150 : 152, nodeH = 46;
    const pos: Record<string, Pos> = {};
    if (vertical) {
      const L = 20 + nodeW / 2, R = W - 20 - nodeW / 2, C = W / 2;
      Object.assign(pos, {
        feeds: { x: L, y: 30 }, apis: { x: R, y: 30 }, files: { x: C, y: 92 },
        ingest: { x: C, y: 176 }, transform: { x: C, y: 260 }, models: { x: C, y: 344 }, semantic: { x: C, y: 428 },
        apps: { x: L, y: 512 }, activate: { x: R, y: 512 },
        appsOut: { x: L, y: 596 }, reports: { x: L, y: 652 }, platforms: { x: R, y: 596 },
      });
    } else {
      for (const [id, [c, r]] of Object.entries(GRID)) pos[id] = { x: 20 + nodeW / 2 + c * ((W - 40 - nodeW) / 6), y: 40 + r * 70 };
    }
    const bandY = vertical ? 790 : 330;
    pos.orch = { x: vertical ? 20 + nodeW / 2 : W / 2 - 160, y: bandY };
    pos.monitor = { x: vertical ? W - 20 - nodeW / 2 : W / 2 + 160, y: bandY };

    svg.setAttribute('viewBox', `0 0 ${W} ${bandY + 40}`);
    svg.replaceChildren();
    const edgeLayer = el('g', {}, svg), partLayer = el('g', {}, svg), nodeLayer = el('g', {}, svg);
    el('line', { x1: 20, x2: W - 20, y1: bandY - 42, y2: bandY - 42, class: 'graph__edge', 'stroke-dasharray': '2 5' }, edgeLayer);
    el('text', { x: 20, y: bandY - 50, class: 'graph__band' }, edgeLayer).textContent = 'ACROSS EVERY STEP';

    edges = data.edges.filter(([a, b]) => pos[a] && pos[b]).map(([a, b]) => {
      const p = pos[a], q = pos[b];
      let d: string;
      if (vertical) {
        const y1 = p.y + nodeH / 2, y2 = q.y - nodeH / 2, my = (y1 + y2) / 2;
        d = `M${p.x},${y1} C${p.x},${my} ${q.x},${my} ${q.x},${y2}`;
      } else {
        const x1 = p.x + nodeW / 2, x2 = q.x - nodeW / 2, mx = (x1 + x2) / 2;
        d = `M${x1},${p.y} C${mx},${p.y} ${mx},${q.y} ${x2},${q.y}`;
      }
      const path = el('path', { d, class: 'graph__edge' }, edgeLayer);
      return { a, b, path, len: path.getTotalLength() };
    });

    for (const [id, n] of Object.entries(data.nodes)) {
      const p = pos[id];
      if (!p) continue;
      const g = el('g', {
        class: `graph__node kind-${n.kind ?? 'step'}${n.hub ? ' is-hub' : ''}`, tabindex: 0, role: 'button',
        // Starts with the visible text (label, then step) so voice control can target it by what it shows.
        'aria-label': `${n.label}${n.step ? `, Step ${n.step}` : ''}. ${n.text}`, 'data-id': id,
        transform: `translate(${p.x - nodeW / 2},${p.y - nodeH / 2})`,
      }, nodeLayer);
      el('rect', { width: nodeW, height: nodeH, rx: 7 }, g);
      el('text', { x: nodeW / 2, y: n.step ? 20 : 28, 'text-anchor': 'middle' }, g).textContent = n.label;
      if (n.step) el('text', { x: nodeW / 2, y: 36, 'text-anchor': 'middle', class: 'sub' }, g).textContent = `Step ${n.step}`;
      // Mouse: show only while hovering. Keyboard: show while focused. Touch: tap to toggle.
      let pointer = '';
      g.addEventListener('pointerdown', (e) => { pointer = e.pointerType; });
      g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(id); });
      g.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hide(); g.blur(); } });
      g.addEventListener('focus', () => { if (g.matches(':focus-visible')) show(id); });
      g.addEventListener('blur', () => { if (active === id) hide(); });
      g.addEventListener('click', () => {
        if (pointer !== 'mouse') active === id ? hide() : show(id);
        pointer = '';
      });
      g.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hide(); g.blur(); } });
    }

    particles = [];
    if (!reduced) {
      for (const edge of edges) for (let i = 0; i < 4; i++) {
        particles.push({ edge, c: el('circle', { r: 2 }, partLayer), t: Math.random(), v: 0.25 + Math.random() * 0.2 });
      }
    }
  };

  const nodeEl = (id: string) => svg.querySelector<SVGGElement>(`[data-id="${id}"]`);
  const show = (id: string) => {
    active = id;
    const n = data.nodes[id], g = nodeEl(id);
    if (!g) return;
    svg.querySelectorAll('.graph__node').forEach((x) => x.classList.toggle('is-active', x === g));
    edges.forEach((e) => e.path.classList.toggle('is-lit', e.a === id || e.b === id));
    const h = document.createElement('h2');
    h.textContent = n.step ? `${n.step}. ${n.label}` : n.label;
    const p = document.createElement('p');
    p.textContent = n.text;
    tip.replaceChildren(h, p);
    tip.hidden = false;
    const r = g.getBoundingClientRect(), s = root.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    const left = Math.max(8, Math.min(r.left - s.left + r.width / 2 - tw / 2, s.width - tw - 8));
    let top = r.bottom - s.top + 10;
    if (top + th > s.height + 40 && r.top - s.top - th - 10 > 0) top = r.top - s.top - th - 10;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };
  const hide = () => {
    active = null;
    tip.hidden = true;
    svg.querySelectorAll('.graph__node').forEach((x) => x.classList.remove('is-active'));
    edges.forEach((e) => e.path.classList.remove('is-lit'));
  };

  let last = 0, raf = 0, visible = true;
  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const css = getComputedStyle(document.documentElement);
    const raw = css.getPropertyValue('--raw').trim(), accent = css.getPropertyValue('--accent').trim();
    for (const p of particles) {
      p.t = (p.t + p.v * dt) % 1;
      const pt = p.edge.path.getPointAtLength(p.t * p.edge.len);
      p.c.setAttribute('cx', String(pt.x));
      p.c.setAttribute('cy', String(pt.y));
      p.c.setAttribute('fill', rawSet.has(p.edge.a) ? raw : accent);
      p.c.setAttribute('opacity', (Math.min(p.t, 1 - p.t) * 6).toFixed(2));
    }
    if (particles.length && visible && !document.hidden) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const wake = () => { if (!raf && particles.length && visible && !document.hidden) raf = requestAnimationFrame(frame); };

  layout();
  wake();
  new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; wake(); }).observe(root);
  document.addEventListener('visibilitychange', wake);
  new ResizeObserver(() => {
    if ((root.clientWidth < 760) !== vertical) { hide(); layout(); wake(); }
    else if (active) show(active);
  }).observe(root);
  document.addEventListener('pointerdown', (e) => { if (!(e.target as Element).closest('.graph__node')) hide(); });
}
