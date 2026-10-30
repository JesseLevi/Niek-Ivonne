// De flight plan-lijn: de gestippelde route die van boven naar beneden door de hele film
// loopt (docs/concept.md › Kernidee). Elke scène tekent haar eigen stuk in een SVG over het
// hele scherm. Een stuk begint bovenaan op de x waar het vorige stuk onderaan eindigde, dus
// als de scènes tegen elkaar aan schuiven loopt de lijn zonder gaten door.
//
// Markup: <svg data-flight-plan data-route='[{"points":[[50,0],{"at":"[data-pin=lima]"},[50,100]]}]'>
//   points  [x, y] in % van de scène, of {"at": selector, "dx", "dy"} als ankerpunt op een element
//   start / end: "dot" voor een stip aan het begin of einde
//   draw    [van, tot]: deel van de voortgang waarin deze lijn wordt getekend (standaard [0, 1])
//
// Vaste rails tussen scènes (zie RAIL in src/lib/flight-plan.ts): één lijn op 50%, of
// twee lijnen (Lima links, Nederland rechts) tot ze in Barcelona samenkomen.

import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import type { RoutePoint, RouteLine } from '../lib/flight-plan';

gsap.registerPlugin(DrawSVGPlugin);

const SVG = 'http://www.w3.org/2000/svg';
let uid = 0;

/** Positie van `el` binnen `container` volgens de layout, zonder transforms (die animeren). */
function layoutOffset(el: HTMLElement, container: HTMLElement): { x: number; y: number; w: number; h: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== container) {
    // Container is geen offsetParent (niet gepositioneerd): neem de zichtbare positie.
    const a = el.getBoundingClientRect();
    const b = container.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** Vloeiende lijn door alle punten (Catmull-Rom als kubische Bézier). */
function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  const [first] = points as [[number, number]];
  let d = `M${first[0].toFixed(1)},${first[1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0]!.toFixed(1)},${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)},${c2[1]!.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

interface DrawnLine {
  line: RouteLine;
  reveal: SVGPathElement;
  dots: SVGCircleElement[];
  plane?: { el: SVGGElement; length: number };
}

/** Zelfde silhouet als Plane.astro (64 × 64, neus naar rechts). */
const PLANE_PATH =
  'M60 32c0-2.2-1.8-3.4-4-3.4H40.5L26.6 6.8C26 5.9 25 5.4 24 5.4h-3.2l7.6 23.2H14.2L9.4 21.8C9 21.2 8.3 20.8 7.6 20.8H4.4l3.4 11.2-3.4 11.2h3.2c.7 0 1.4-.4 1.8-1l4.8-6.8h14.2l-7.6 23.2H24c1 0 2-.5 2.6-1.4l13.9-21.8H56c2.2 0 4-1.2 4-3.4Z';
const PLANE_SCALE = 0.6;

export class FlightPlan {
  private lines: DrawnLine[] = [];
  private progress = 0;
  private active = false;

  constructor(
    private svg: SVGSVGElement,
    private container: HTMLElement,
  ) {}

  /** Pas opbouwen als de scène dichtbij is: meten kost layout-tijd, en dat telt op over 15 scènes. */
  activate(): void {
    if (this.active) return;
    this.active = true;
    this.layout();
  }

  /** Opnieuw opbouwen na een resize of als de layout verandert. Eerst alles meten, dan pas schrijven. */
  layout(): void {
    if (!this.active) return;
    const route = JSON.parse(this.svg.dataset.route ?? '[]') as RouteLine[];
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    const resolve = (point: RoutePoint): [number, number] => {
      if (Array.isArray(point)) return [(point[0] / 100) * w, (point[1] / 100) * h];
      const el = this.container.querySelector<HTMLElement>(point.at);
      if (!el) return [w / 2, h / 2];
      const box = layoutOffset(el, this.container);
      return [box.x + box.w * (point.ax ?? 0.5) + (point.dx ?? 0), box.y + box.h * (point.ay ?? 0.5) + (point.dy ?? 0)];
    };

    const measured = route.map((line) => ({ line, points: line.points.map(resolve) }));

    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.svg.replaceChildren();
    const defs = document.createElementNS(SVG, 'defs');
    this.svg.append(defs);
    this.lines = [];

    for (const { line, points } of measured) {
      const d = smoothPath(points);
      const id = `flight-plan-${++uid}`;

      // Masker met een doorlopende lijn die "getekend" wordt; daardoor verschijnen de stippen.
      const mask = document.createElementNS(SVG, 'mask');
      mask.id = id;
      mask.setAttribute('maskUnits', 'userSpaceOnUse');
      const reveal = document.createElementNS(SVG, 'path');
      reveal.setAttribute('d', d);
      reveal.setAttribute('class', 'flight-plan-reveal');
      mask.append(reveal);
      defs.append(mask);

      // Lichte rand om elke stip, zodat de lijn ook over donkere vlakken (bergen) zichtbaar blijft.
      const halo = document.createElementNS(SVG, 'path');
      halo.setAttribute('d', d);
      halo.setAttribute('class', 'flight-plan-halo');
      halo.setAttribute('mask', `url(#${id})`);
      this.svg.append(halo);

      const dotted = document.createElementNS(SVG, 'path');
      dotted.setAttribute('d', d);
      dotted.setAttribute('class', 'flight-plan-line');
      dotted.setAttribute('mask', `url(#${id})`);
      this.svg.append(dotted);

      const dots: SVGCircleElement[] = [];
      for (const [where, at] of [
        ['start', points[0]],
        ['end', points[points.length - 1]],
      ] as const) {
        if (line[where] !== 'dot' || !at) continue;
        const dot = document.createElementNS(SVG, 'circle');
        dot.setAttribute('cx', String(at[0]));
        dot.setAttribute('cy', String(at[1]));
        dot.setAttribute('r', '5');
        dot.setAttribute('class', 'flight-plan-dot');
        dot.dataset.at = where;
        this.svg.append(dot);
        dots.push(dot);
      }
      let plane: DrawnLine['plane'];
      if (line.plane) {
        const el = document.createElementNS(SVG, 'g');
        el.setAttribute('class', 'flight-plan-plane');
        const shape = document.createElementNS(SVG, 'path');
        shape.setAttribute('d', PLANE_PATH);
        shape.setAttribute('transform', 'translate(-58 -32)');
        el.append(shape);
        this.svg.append(el);
        plane = { el, length: reveal.getTotalLength() };
      }
      this.lines.push({ line, reveal, dots, plane });
    }
    this.set(this.progress);
  }

  /** Teken de lijnen tot `progress` (0–1). */
  set(progress: number): void {
    this.progress = progress;
    for (const { line, reveal, dots, plane } of this.lines) {
      const [from, to] = line.draw ?? [0, 1];
      const local = Math.min(Math.max((progress - from) / Math.max(to - from, 0.0001), 0), 1);
      gsap.set(reveal, { drawSVG: `0% ${local * 100}%` });
      if (plane) {
        // Vliegtuigje op de punt, in de richting van de lijn; weg zodra de lijn af is.
        const visible = local > 0.001 && local < 0.999;
        plane.el.style.visibility = visible ? 'visible' : 'hidden';
        if (visible) {
          const at = local * plane.length;
          const p = reveal.getPointAtLength(at);
          const q = reveal.getPointAtLength(Math.min(at + 2, plane.length));
          const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
          plane.el.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle}) scale(${PLANE_SCALE})`);
        }
      }
      for (const dot of dots) {
        const visible = dot.dataset.at === 'start' ? local > 0 : local >= 0.999;
        dot.classList.toggle('is-visible', visible);
      }
    }
  }
}
