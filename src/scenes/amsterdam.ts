// Scène 8: het grote vliegtuig volgt een gebogen route (MotionPath) met een witte condensstreep.
// Tekst, grote boarding pass met ONE WAY als typemachine, koffer, dan het grachtenpand.

import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { place, typewriter } from '../scripts/text';
import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

const amsterdam: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const plane = el.querySelector<HTMLElement>('[data-big-plane]');
    const flight = el.querySelector<SVGPathElement>('[data-flight]');
    const trail = el.querySelector<SVGPathElement>('[data-trail]');
    const trip = el.querySelector<HTMLElement>('[data-trip]');
    const pass = el.querySelector<HTMLElement>('[data-pass]');
    const suitcase = el.querySelector('.suitcase');
    const oneWay = el.querySelector<HTMLElement>('[data-one-way]');
    const home = el.querySelector<HTMLElement>('[data-home]');
    const house = el.querySelector<HTMLElement>('.house');

    animateMeta(ctx, el, 0);

    if (plane && flight && trail && !reducedMotion) {
      timeline.fromTo(
        plane,
        { motionPath: { path: flight, align: flight, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: 0 } },
        { motionPath: { path: flight, align: flight, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: 1 }, duration: 0.54, ease: 'none' },
        0,
      );
      timeline.fromTo(trail, { drawSVG: '0% 0%' }, { drawSVG: '0% 96%', duration: 0.54, ease: 'none' }, 0);
      timeline.to(trail, { opacity: 0, duration: 0.12 }, 0.54);
    } else if (plane) {
      gsap.set(plane, { autoAlpha: 0 });
    }

    const [lineAt] = animateLines(ctx, el, 0.08, 0.2);
    if (pass) timeline.from(pass, { autoAlpha: 0, y: reducedMotion ? 0 : 50, rotate: reducedMotion ? 0 : -4, duration: 0.1, ease: 'power3.out' }, (lineAt ?? 0.1) + 0.12);
    if (oneWay) place(timeline, typewriter(oneWay, { reducedMotion }), (lineAt ?? 0.1) + 0.24, 0.1);
    if (suitcase) timeline.from(suitcase, { autoAlpha: 0, x: reducedMotion ? 0 : '30vw', duration: 0.1, ease: 'power2.out' }, 0.4);

    // Thuiskomen: pass en koffer weg, het grachtenpand komt op, één raam gaat aan.
    if (trip && home) {
      // Daarna blijft het verlichte huis een flink stuk staan (0.76 → 1).
      timeline.to(trip, { autoAlpha: 0, y: reducedMotion ? 0 : -30, duration: 0.06 }, 0.54);
      timeline.from(home, { autoAlpha: 0, y: reducedMotion ? 0 : 40, duration: 0.1, ease: 'power2.out' }, 0.57);
      if (house) timeline.fromTo(house, { filter: 'brightness(0.75) saturate(0.85)' }, { filter: 'brightness(1) saturate(1)', duration: 0.1 }, 0.64);
      const glows = el.querySelectorAll('[data-glow]');
      timeline.to(glows, { opacity: 1, duration: 0.05, stagger: 0.03 }, 0.68);
    }
  },
};

export default amsterdam;
