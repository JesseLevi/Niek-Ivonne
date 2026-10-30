// Scène 0: splash. Wordt als enige direct geladen. Volledige versie (raam, rolluik): #10 en #11.

import type { Scene } from './types';

const splash: Scene = {
  init({ el, timeline, reducedMotion }) {
    if (reducedMotion) return;
    // Bij wegscrollen: scrollhint eerst weg, dan schuiven namen en datum iets omhoog.
    timeline.to(el.querySelectorAll('[data-splash-hint]'), { autoAlpha: 0, duration: 0.3 }, 0);
    timeline.to(el.querySelectorAll('[data-splash-title]'), { yPercent: -30, autoAlpha: 0, duration: 0.8 }, 0.1);
  },
};

export default splash;
