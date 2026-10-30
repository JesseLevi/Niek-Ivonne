// Demopagina /<taal>/lab/: elke tekstanimatie op een eigen vastgepinde scène, gescrubd met de scroll.

import { isLocale } from '../lib/i18n';
import { counter, lineReveal, place, splitFlap, typewriter, wordBlur } from '../scripts/text';
import type { Scene } from './types';

const lab: Scene = {
  init({ el, timeline, reducedMotion, lang }) {
    const options = { reducedMotion };
    const target = el.querySelector<HTMLElement>('[data-demo-target]') ?? el;
    const locale = isLocale(lang) ? lang : 'en';

    switch (el.dataset.demo) {
      case 'line-reveal':
        place(timeline, lineReveal(target, options), 0.1, 0.6);
        break;
      case 'word-blur':
        place(timeline, wordBlur(target, options), 0.1, 0.6);
        break;
      case 'split-flap':
        place(timeline, splitFlap(target, (target.dataset.words ?? '').split('|'), options), 0.05, 0.8);
        break;
      case 'typewriter':
        place(timeline, typewriter(target, options), 0.1, 0.5);
        break;
      case 'counter':
        for (const [i, span] of [...el.querySelectorAll<HTMLElement>('[data-counter]')].entries()) {
          const tween = counter(span, {
            ...options,
            lang: locale,
            to: Number(span.dataset.to),
            plus: span.dataset.plus !== undefined,
            steps: span.dataset.steps ? span.dataset.steps.split(',').map(Number) : undefined,
          });
          place(timeline, tween, 0.05 + i * 0.1, 0.6);
        }
        break;
    }
  },
};

export default lab;
