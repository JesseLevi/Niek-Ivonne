// Scène 3: Nederland. Polder, tweeling, pijltje naar de juiste. Verkeerde aantikken: "Nope."

import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

gsap.registerPlugin(DrawSVGPlugin);

const listeners = new WeakMap<HTMLElement, AbortController>();

const netherlands: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const image = el.querySelector('.image');
    const twins = el.querySelectorAll<HTMLElement>('[data-twin]');
    const arrow = el.querySelectorAll('[data-arrow] path');

    animateMeta(ctx, el, 0);
    if (image) timeline.from(image, { autoAlpha: 0, y: reducedMotion ? 0 : 40, duration: 0.15, ease: 'power2.out' }, 0);
    timeline.from(twins, { autoAlpha: 0, y: reducedMotion ? 0 : 20, duration: 0.08, stagger: 0.03 }, 0.12);
    const [, joke] = animateLines(ctx, el, 0.22, 0.8);
    if (reducedMotion) timeline.from(arrow, { autoAlpha: 0, duration: 0.1 }, joke ?? 0.6);
    else timeline.from(arrow, { drawSVG: '0%', duration: 0.1, stagger: 0.05 }, joke ?? 0.6);

    // Verrassing: de verkeerde tweeling (links) aantikken.
    const surprise = el.querySelector<HTMLElement>('[data-surprise]');
    const controller = new AbortController();
    listeners.set(el, controller);
    let hide = 0;
    for (const twin of twins) {
      twin.addEventListener(
        'click',
        () => {
          gsap.fromTo(twin, { y: 0 }, { y: -10, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' });
          if (twin.dataset.twin !== 'left' || !surprise) return;
          surprise.hidden = false;
          window.clearTimeout(hide);
          hide = window.setTimeout(() => (surprise.hidden = true), 2200);
        },
        { signal: controller.signal },
      );
    }
  },
  destroy({ el }) {
    listeners.get(el)?.abort();
  },
};

export default netherlands;
