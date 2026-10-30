// Scène 6: het vliegtuig keert om en vliegt terug, de boarding pass schuift in beeld,
// de skyline van Barcelona komt op bij zonsondergang.

import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const visit: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const pass = el.querySelector('[data-pass]');
    const skyline = el.querySelector('[data-skyline]');

    animateMeta(ctx, el, 0);
    if (pass) timeline.from(pass, { autoAlpha: 0, x: reducedMotion ? 0 : '60vw', rotate: reducedMotion ? 0 : 8, duration: 0.15, ease: 'power3.out' }, 0.12);
    animateLines(ctx, el, 0.3, 0.7);
    if (skyline) timeline.from(skyline, { autoAlpha: 0, yPercent: reducedMotion ? 0 : 40, duration: 0.25, ease: 'power2.out' }, 0.5);
  },
};

export default visit;
