// Scène 11: de kaart zoomt in op het Empordà, Mas Terrats verschijnt, de uitnodiging
// komt uit een waas, en groot de datum. De lijn eindigt in een stip op Mas Terrats.

import { MAP_PINS } from '../lib/geo';
import { lineReveal, place } from '../scripts/text';
import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const girona: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const map = el.querySelector<HTMLElement>('[data-map]');
    const mapImage = map?.querySelector('.map-image');
    const venue = el.querySelector('[data-venue]');
    const date = el.querySelector<HTMLElement>('[data-date]');

    animateMeta(ctx, el, 0);
    if (map && mapImage) {
      timeline.from(map, { autoAlpha: 0, duration: 0.06 }, 0);
      if (!reducedMotion) timeline.fromTo(mapImage, { scale: 1 }, { scale: 9, transformOrigin: `${MAP_PINS.girona.x}% ${MAP_PINS.girona.y}%`, duration: 0.24, ease: 'power2.inOut' }, 0.04);
      timeline.to(map, { autoAlpha: 0, duration: 0.06 }, 0.3);
    }
    if (venue) timeline.from(venue, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.9, duration: 0.1, ease: 'power2.out' }, 0.3);
    animateLines(ctx, el, 0.42, 0.72, { blur: true });
    if (date) place(timeline, lineReveal(date, { reducedMotion }), 0.78, 0.12);
  },
};

export default girona;
