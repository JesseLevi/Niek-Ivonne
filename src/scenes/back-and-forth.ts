// Scène 7: passes stapelen zich op; het vliegtuig trekt de zigzaglijn heen en weer (flight plan).
// De achtergrond wisselt mee (kleurstops in tokens.css: oker ↔ grijsblauw).

import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const backAndForth: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const passes = [...el.querySelectorAll<HTMLElement>('[data-pass]')];

    animateMeta(ctx, el, 0);
    const step = 0.7 / Math.max(passes.length, 1);
    passes.forEach((pass, i) => {
      const side = i % 2 ? 1 : -1;
      timeline.from(pass, { autoAlpha: 0, xPercent: reducedMotion ? 0 : side * 120, duration: step * 0.7, ease: 'power3.out' }, 0.08 + i * step);
    });

    animateLines(ctx, el, 0.25, 0.85);
  },
};

export default backAndForth;
