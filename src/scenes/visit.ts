// Scène 6: het vliegtuig keert om en vliegt terug, de boarding pass schuift in beeld,
// de skyline van Barcelona komt op bij zonsondergang.

import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const visit: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const plane = el.querySelector('[data-plane]');
    const pass = el.querySelector('[data-pass]');
    const skyline = el.querySelector('[data-skyline]');

    animateMeta(ctx, el, 0);
    if (plane) {
      if (reducedMotion) timeline.set(plane, { autoAlpha: 0 }, 0);
      else
        timeline
          .fromTo(plane, { x: '20vw', y: '-30svh', rotate: 145 }, { x: 0, y: 0, rotate: 180, duration: 0.15, ease: 'power1.out' }, 0)
          .to(plane, { x: '-80vw', y: '6svh', duration: 0.2, ease: 'power1.in' }, 0.15);
    }
    if (pass) timeline.from(pass, { autoAlpha: 0, x: reducedMotion ? 0 : '60vw', rotate: reducedMotion ? 0 : 8, duration: 0.15, ease: 'power3.out' }, 0.12);
    animateLines(ctx, el, 0.3, 0.7);
    if (skyline) timeline.from(skyline, { autoAlpha: 0, yPercent: reducedMotion ? 0 : 40, duration: 0.25, ease: 'power2.out' }, 0.5);
  },
};

export default visit;
