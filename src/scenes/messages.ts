// Scène 5: het vliegtuig vertrekt diagonaal, de telefoon verschijnt en de appjes poppen op
// (en verdwijnen weer bij terugscrollen). De teller loopt van 1 naar 3.000+.

import { isLocale } from '../lib/i18n';
import { counter, place } from '../scripts/text';
import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const messages: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion, lang } = ctx;
    const phone = el.querySelector('[data-phone]');
    const bubbles = el.querySelectorAll('[data-bubble]');
    const tally = el.querySelector<HTMLElement>('[data-messages-counter]');

    animateMeta(ctx, el, 0);
    const [, started] = animateLines(ctx, el, 0.06, 0.4);
    if (phone) timeline.from(phone, { autoAlpha: 0, y: reducedMotion ? 0 : 60, duration: 0.12, ease: 'power2.out' }, 0.22);

    // Appjes: één per stap, tijdstempels steeds later.
    const from = (started ?? 0.3) + 0.04;
    const step = (0.9 - from) / Math.max(bubbles.length, 1);
    bubbles.forEach((bubble, i) => {
      timeline.from(bubble, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.6, y: reducedMotion ? 0 : 12, transformOrigin: '50% 100%', duration: step * 0.4, ease: 'back.out(1.8)' }, from + i * step);
    });

    if (tally) {
      place(
        timeline,
        counter(tally, {
          reducedMotion,
          lang: isLocale(lang) ? lang : 'en',
          to: Number(tally.dataset.to),
          steps: tally.dataset.steps?.split(',').map(Number),
          plus: tally.dataset.plus !== undefined,
        }),
        from,
        0.92 - from,
      );
    }
  },
};

export default messages;
