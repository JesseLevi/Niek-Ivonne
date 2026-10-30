// Scène 1: de camera komt door het glas, de kaart verschijnt, twee pins, de teller loopt op.
// Aan het eind zoomt de kaart in op Lima (overgang naar scène 2).

import { MAP_PINS } from '../lib/geo';
import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const twoPlaces: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const map = el.querySelector<HTMLElement>('[data-map]');
    const pins = el.querySelectorAll('[data-pin]');

    animateMeta(ctx, el, 0.02);
    if (map) {
      timeline.from(map, { autoAlpha: 0, scale: reducedMotion ? 1 : 1.25, filter: reducedMotion ? 'none' : 'blur(8px)', duration: 0.18, ease: 'power2.out' }, 0);
    }
    timeline.from(pins, { autoAlpha: 0, scale: 0, duration: 0.06, stagger: 0.05, ease: 'back.out(2)' }, 0.18);
    animateLines(ctx, el, 0.28, 0.7);

    if (map && !reducedMotion) {
      // Inzoomen op de Lima-pin.
      timeline.to(map, { scale: 4, transformOrigin: `${MAP_PINS.lima.x}% ${MAP_PINS.lima.y}%`, duration: 0.16, ease: 'power2.in' }, 0.84);
      timeline.to(el.querySelectorAll('.lines, .meta'), { autoAlpha: 0, duration: 0.08 }, 0.84);
      timeline.to(map, { autoAlpha: 0, duration: 0.06 }, 0.94);
    }
  },
};

export default twoPlaces;
