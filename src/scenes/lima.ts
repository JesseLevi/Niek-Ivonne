// Scène 2: Lima. Het raam opent zich uit de ingezoomde kaart; regels; de koffers worden gepakt.

import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const lima: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const image = el.querySelector('[data-scene-image]');
    animateMeta(ctx, el, 0);
    if (image) timeline.from(image, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.85, y: reducedMotion ? 0 : 30, duration: 0.18, ease: 'power2.out' }, 0);
    animateLines(ctx, el, 0.14, 0.82);
    if (image && !reducedMotion) timeline.to(image, { y: -12, duration: 0.8 }, 0.18);
  },
};

export default lima;
