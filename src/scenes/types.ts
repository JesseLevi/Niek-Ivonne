import type { Locale } from '../lib/i18n';

export interface SceneContext {
  /** Het `<section data-scene>`-element. */
  el: HTMLElement;
  /** Scène-id uit story.yml (of `splash`, `info`). */
  id: string;
  lang: Locale;
  /** `prefers-reduced-motion`: geen pinning, alleen rustige fades. */
  reducedMotion: boolean;
  /** Smalle schermen: kortere scrollafstanden. */
  mobile: boolean;
  /**
   * De tijdlijn van de scène. Lengte 1 = de hele vastgepinde scrollafstand;
   * zet animaties op posities tussen 0 en 1. Normaal gekoppeld aan de scroll (scrub,
   * dus ook terug). Bij reduced motion speelt hij één keer rustig af zodra de scène
   * in beeld komt.
   */
  timeline: gsap.core.Timeline;
  /** Lenis-instantie (null bij reduced motion), bijv. om naar een plek te scrollen. */
  lenis: () => import('lenis').default | null;
}

export interface Scene {
  /** Bouwt de animaties op `ctx.timeline`. Wordt opnieuw aangeroepen als de layout wisselt (mobiel/desktop, reduced motion). */
  init(ctx: SceneContext): void | Promise<void>;
  /** Opruimen wat GSAP niet zelf terugdraait (event listeners, observers). */
  destroy?(ctx: SceneContext): void;
}

export interface SceneModule {
  default: Scene;
}
