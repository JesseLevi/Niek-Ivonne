// Aftiteling: het rolluik zakt langzaam over het Empordà, de credits rollen op.

import type { Scene } from './types';

const credits: Scene = {
  init({ el, timeline, reducedMotion }) {
    const win = el.querySelector<HTMLElement>('[data-window]');
    const lines = el.querySelectorAll('[data-credit]');
    if (win) {
      timeline.from(win, { autoAlpha: 0, y: reducedMotion ? 0 : 30, duration: 0.15 }, 0);
      // Rolluik van open (-61.6%) tot helemaal dicht (0%), zie Window.astro.
      if (!reducedMotion) timeline.fromTo(win, { '--shade': '-61.6%' }, { '--shade': '0%', duration: 0.7, ease: 'power1.inOut' }, 0.25);
    }
    timeline.from(lines, { autoAlpha: 0, y: reducedMotion ? 0 : 24, duration: 0.12, stagger: 0.1, ease: 'power2.out' }, 0.15);
  },
};

export default credits;
