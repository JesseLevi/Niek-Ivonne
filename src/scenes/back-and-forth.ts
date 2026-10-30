// Scène 7: passes stapelen zich op, het vliegtuig pendelt heen en weer met de scroll.
// De achtergrond wisselt mee (kleurstops in tokens.css: oker ↔ grijsblauw).

import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const backAndForth: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const passes = [...el.querySelectorAll<HTMLElement>('[data-pass]')];
    const plane = el.querySelector('[data-plane]');

    animateMeta(ctx, el, 0);
    const step = 0.7 / Math.max(passes.length, 1);
    passes.forEach((pass, i) => {
      const side = i % 2 ? 1 : -1;
      timeline.from(pass, { autoAlpha: 0, xPercent: reducedMotion ? 0 : side * 120, duration: step * 0.7, ease: 'power3.out' }, 0.08 + i * step);
    });

    if (plane) {
      if (reducedMotion) timeline.set(plane, { autoAlpha: 0 }, 0);
      else {
        const legs = passes.length || 4;
        const leg = 0.85 / legs;
        for (let i = 0; i < legs; i++) {
          const right = i % 2 === 0;
          timeline.set(plane, { rotate: right ? 0 : 180 }, 0.05 + i * leg);
          timeline.fromTo(plane, { x: right ? '-38vw' : '38vw' }, { x: right ? '38vw' : '-38vw', duration: leg, ease: 'sine.inOut', immediateRender: false }, 0.05 + i * leg);
        }
      }
    }
    animateLines(ctx, el, 0.25, 0.85);
  },
};

export default backAndForth;
