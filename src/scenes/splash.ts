// Scène 0: splash. Wordt als enige direct geladen.
// Rolluik als dark-mode-schakelaar, gastbegroeting, en bij wegscrollen duikt de camera
// door het glas: het raam vult het scherm en de wolken trekken open (overgang naar scène 1).

import { showGreeting } from '../scripts/guest';
import { initShade } from '../scripts/shade';
import type { Scene } from './types';

const splash: Scene = {
  init({ el, timeline, reducedMotion }) {
    const win = el.querySelector<HTMLElement>('[data-window]');
    if (win) initShade(win);
    showGreeting();
    if (reducedMotion || !win) return;

    const wrap = el.querySelector<HTMLElement>('[data-splash-window]');
    const glass = win.querySelector<HTMLElement>('.glass');
    const view = win.querySelector<HTMLElement>('[data-view]');
    const frame = win.querySelector<HTMLElement>('.frame-img');
    const control = win.querySelector<HTMLElement>('[data-shade-toggle]');

    // Schaal waarbij het glas (67% × 62% van het raam) het hele scherm bedekt.
    const diveScale = () => {
      const box = win.getBoundingClientRect();
      return Math.max(innerWidth / (box.width * 0.6), innerHeight / (box.height * 0.55)) * 1.15;
    };

    timeline
      .to(el.querySelectorAll('[data-splash-hint], [data-guest-greeting]'), { autoAlpha: 0, duration: 0.1 }, 0)
      .to(el.querySelector('.flight-plan'), { autoAlpha: 0, duration: 0.1 }, 0)
      .to(el.querySelector('[data-splash-title]'), { autoAlpha: 0, y: 40, duration: 0.25 }, 0.02)
      .set(control, { pointerEvents: 'none' }, 0.02)
      // Het raam naar het midden van het scherm en groot.
      // (offsetTop is t.o.v. het vastgepinde frame, dat bovenaan het scherm staat)
      .to(wrap, { y: () => innerHeight / 2 - ((wrap?.offsetTop ?? 0) + (wrap?.offsetHeight ?? 0) / 2), duration: 0.45, ease: 'power1.inOut' }, 0.05)
      .to(win, { scale: diveScale, transformOrigin: '50% 51%', duration: 0.65, ease: 'power2.in' }, 0.1)
      .to(frame, { autoAlpha: 0, duration: 0.15 }, 0.62)
      // De wolken trekken open.
      .to(view, { scale: 1.6, filter: 'blur(6px)', duration: 0.3, ease: 'power1.in' }, 0.68)
      .to(glass, { autoAlpha: 0, duration: 0.22 }, 0.78);
  },
};

export default splash;
