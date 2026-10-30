// Scène 4: Barcelona. Gevel, inzoomen op het deurbelpaneel, regels met pauzes.
// Verrassing: de deurbel indrukken.

import { gsap } from 'gsap';
import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

const listeners = new WeakMap<HTMLElement, AbortController>();

const barcelona: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const facade = el.querySelector('.facade');
    const intercom = el.querySelector<HTMLElement>('[data-intercom]');

    animateMeta(ctx, el, 0);
    if (facade) timeline.from(facade, { autoAlpha: 0, y: reducedMotion ? 0 : 40, duration: 0.12, ease: 'power2.out' }, 0);
    if (intercom) {
      timeline.set(intercom, { autoAlpha: 0 }, 0);
      if (facade && !reducedMotion) {
        timeline.to(facade, { scale: 2.6, transformOrigin: '50% 92%', autoAlpha: 0, duration: 0.14, ease: 'power2.in' }, 0.2);
      } else if (facade) {
        timeline.to(facade, { autoAlpha: 0, duration: 0.1 }, 0.2);
      }
      timeline.fromTo(intercom, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, 0.28);
      timeline.from(el.querySelectorAll('[data-plate]'), { autoAlpha: 0, duration: 0.05, stagger: 0.04 }, 0.38);
    }
    animateLines(ctx, el, 0.3, 0.9);

    const surprise = el.querySelector<HTMLElement>('[data-surprise]');
    const controller = new AbortController();
    listeners.set(el, controller);
    let hide = 0;
    for (const bell of el.querySelectorAll<HTMLElement>('[data-bell]')) {
      bell.addEventListener(
        'click',
        () => {
          if (intercom && !reducedMotion) gsap.fromTo(intercom, { x: -3 }, { x: 3, duration: 0.05, repeat: 7, yoyo: true, clearProps: 'x' });
          navigator.vibrate?.(200);
          if (!surprise) return;
          surprise.hidden = false;
          window.clearTimeout(hide);
          hide = window.setTimeout(() => (surprise.hidden = true), 2600);
        },
        { signal: controller.signal },
      );
    }
  },
  destroy({ el }) {
    listeners.get(el)?.abort();
  },
};

export default barcelona;
