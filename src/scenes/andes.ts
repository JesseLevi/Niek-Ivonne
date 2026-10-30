// Scène 10: de climax. Traag: lange pin, alle UI weg (data-hide-ui).
// Raam als kader verdwijnt, bergen rijzen op (parallax), de zin komt uit een waas,
// lange pauze, het ringdoosje gaat open, en groot: "Sí."

import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const andes: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const frame = el.querySelector('[data-window-frame]');
    const ridges = [...el.querySelectorAll('[data-ridge]')];
    const closed = el.querySelector('.box-closed');
    const open = el.querySelector('.box-open');
    const ring = el.querySelector('[data-ring]');

    animateMeta(ctx, el, 0.02);

    // Het raam als kader: we kijken naar buiten, dan valt het kader weg.
    if (frame) {
      if (reducedMotion) timeline.set(frame, { autoAlpha: 0 }, 0);
      else timeline.fromTo(frame, { scale: 2.4, autoAlpha: 1 }, { scale: 4, autoAlpha: 0, duration: 0.18, ease: 'power1.in' }, 0.02);
    }

    // Bergen rijzen laag voor laag op uit de onderkant (ver eerst, langzaam).
    ridges.forEach((ridge, i) => {
      timeline.from(ridge, { yPercent: reducedMotion ? 0 : 100, autoAlpha: reducedMotion ? 0 : 1, duration: 0.3, ease: 'power2.out' }, 0.02 + i * 0.05);
      if (!reducedMotion) timeline.to(ridge, { yPercent: -4 * (5 - i), duration: 0.6 }, 0.35);
    });

    // De vraag (woord-fade met blur), lange pauze, dan "Sí." (pause: true in story.yml).
    const times = animateLines(ctx, el, 0.28, 0.86, { blur: true });
    const yes = times[times.length - 1] ?? 0.8;
    if (ring) timeline.from(ring, { autoAlpha: 0, y: reducedMotion ? 0 : 30, duration: 0.08 }, 0.4);
    if (closed && open) {
      timeline.set(open, { autoAlpha: 0 }, 0);
      timeline.to(closed, { autoAlpha: 0, duration: 0.06 }, yes - 0.08);
      timeline.to(open, { autoAlpha: 1, duration: 0.06 }, yes - 0.08);
      if (!reducedMotion && ring) timeline.fromTo(ring, { scale: 1 }, { scale: 1.08, duration: 0.05, yoyo: true, repeat: 1, ease: 'power1.inOut' }, yes - 0.06);
    }
  },
};

export default andes;
