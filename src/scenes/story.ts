// Algemene verhaalscène: label, beeld en de regels uit story.yml komen één voor één binnen.
// Scènes met eigen beeld en interactie (scène 1, 8, ...) krijgen later een eigen module.

import type { Scene } from './types';

const START = 0.08; // eerste regel na het beeld
const END = 0.82; // laatste regel ruim vóór het einde van de pin, zodat hij even blijft staan

const story: Scene = {
  init({ el, timeline, reducedMotion }) {
    const label = el.querySelector('[data-scene-label]');
    const image = el.querySelector('[data-scene-image]');
    const lines = [...el.querySelectorAll<HTMLElement>('[data-line]')];

    if (label) timeline.from(label, { autoAlpha: 0, duration: 0.08 }, 0);
    if (image) timeline.from(image, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.94, duration: 0.2 }, 0);

    // Elke regel is een stap; `pause` in story.yml voegt een lege stap toe.
    const steps = lines.reduce((n, line) => n + 1 + (line.dataset.pause !== undefined ? 1 : 0), 0);
    const step = (END - START) / Math.max(steps, 1);
    let at = START;
    for (const line of lines) {
      if (line.dataset.pause !== undefined) at += step;
      timeline.from(line, { autoAlpha: 0, y: reducedMotion ? 0 : 24, duration: step * 0.8, ease: 'power2.out' }, at);
      at += step;
    }
  },
};

export default story;
