// Algemene verhaalscène: label, vertrekbord, beeld en de regels uit story.yml komen één
// voor één binnen. Scènes met eigen beeld en interactie (scène 1, 8, ...) krijgen later
// een eigen module.

import { isLocale } from '../lib/i18n';
import { counter, lineReveal, place, splitFlap, typewriter } from '../scripts/text';
import type { Scene } from './types';

const START = 0.1; // eerste regel na het beeld
const END = 0.8; // laatste regel ruim vóór het einde van de pin, zodat hij even blijft staan

const story: Scene = {
  init({ el, timeline, reducedMotion, lang }) {
    const options = { reducedMotion };
    const label = el.querySelector<HTMLElement>('[data-scene-label]');
    const board = el.querySelector<HTMLElement>('[data-place]');
    const image = el.querySelector('[data-scene-image], .illustration');
    const lines = [...el.querySelectorAll<HTMLElement>('[data-line]')];

    if (label) place(timeline, typewriter(label, options), 0, 0.06);
    if (board) {
      const words = [board.dataset.from || ' ', board.textContent?.trim() ?? ''];
      place(timeline, splitFlap(board, words, options), 0.02, 0.1);
    }
    if (image) timeline.from(image, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.94, duration: 0.15 }, 0);

    // Elke regel is een stap; `pause` in story.yml voegt een lege stap toe.
    const steps = lines.reduce((n, line) => n + 1 + (line.dataset.pause !== undefined ? 1 : 0), 0);
    const step = (END - START) / Math.max(steps, 1);
    let at = START;
    for (const line of lines) {
      if (line.dataset.pause !== undefined) at += step;
      const counters = [...line.querySelectorAll<HTMLElement>('[data-counter]')];
      if (counters.length) {
        // Regels met een teller als geheel binnenhalen; de teller loopt daarna op.
        timeline.from(line, { autoAlpha: 0, y: reducedMotion ? 0 : 16, duration: step * 0.4, ease: 'power2.out' }, at);
        for (const span of counters) {
          place(
            timeline,
            counter(span, {
              ...options,
              to: Number(span.dataset.to),
              plus: span.dataset.plus !== undefined,
              steps: span.dataset.steps?.split(',').map(Number),
              lang: isLocale(lang) ? lang : 'en',
            }),
            at,
            step * 0.9,
          );
        }
      } else if (line.dataset.style === 'mono') {
        place(timeline, typewriter(line, options), at, step * 0.6);
      } else {
        place(timeline, lineReveal(line, options), at, step * 0.8);
      }
      at += step;
    }
  },
};

export default story;
