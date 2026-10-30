// Het skelet van de scroll-film: Lenis (smooth scroll) gekoppeld aan GSAP ScrollTrigger,
// één tijdlijn en pin per scène, lazy loading van scène-modules en de achtergrondlaag.
//
// Markup: <section data-scene="lima" data-module="story" data-pin="200">
//   data-scene   id, en ook de kleurset uit tokens.css (tenzij data-palette)
//   data-module  bestandsnaam in src/scenes/ (zonder .ts); geen = alleen pin + kleur
//   data-pin     scrollafstand in % schermhoogte (standaard 200, 0 = niet vastpinnen)
//   data-hide-ui taalwisselaar en skip-knop weg tijdens deze scène
// Een <svg data-flight-plan> in de scène is het stuk flight plan-lijn (zie flight-plan.ts).

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { isLocale, DEFAULT_LOCALE, type Locale } from '../lib/i18n';
import type { Scene, SceneContext, SceneModule } from '../scenes/types';
import { Background, type BackgroundScene } from './background';
import { FlightPlan } from './flight-plan';
import { takeScrollAfterSwitch } from './language';

gsap.registerPlugin(ScrollTrigger);
// Adresbalk op iOS in- en uitklappen is geen reden om alles opnieuw te meten.
ScrollTrigger.config({ ignoreMobileResize: true });

// Alleen de splash zit in de eerste bundel; de rest wordt per scène geladen.
const eager = import.meta.glob<SceneModule>('../scenes/splash.ts', { eager: true });
const lazy = import.meta.glob<SceneModule>(['../scenes/*.ts', '!../scenes/splash.ts', '!../scenes/types.ts']);

function moduleLoader(name: string): (() => Promise<SceneModule>) | undefined {
  const path = `../scenes/${name}.ts`;
  const loaded = eager[path];
  if (loaded) return () => Promise.resolve(loaded);
  return lazy[path];
}

const DEFAULT_PIN = 200; // % schermhoogte (concept: 150–250%)
const MOBILE_FACTOR = 0.75; // kortere afstanden op telefoons

interface StageScene {
  el: HTMLElement;
  id: string;
  palette: string;
  pin: number;
  load?: () => Promise<SceneModule>;
  module?: Scene;
  loading?: Promise<void>;
  ctx?: SceneContext;
  /** Binnen een scherm van het beeld geweest (modules en lijn zijn dan opgebouwd). */
  near?: boolean;
  plans: FlightPlan[];
}

export interface Stage {
  lenis: Lenis | null;
  scenes: StageScene[];
  /** True als de pagina na een taalwissel naar de oude plek is gesprongen. */
  restored: boolean;
  /** Scroll naar een element (met Lenis als dat aan staat). */
  scrollTo(target: HTMLElement | number, immediate?: boolean): void;
}

export function startStage(): Stage {
  const root = document.documentElement;
  const langAttr = root.lang;
  const lang: Locale = isLocale(langAttr) ? langAttr : DEFAULT_LOCALE;

  const scenes: StageScene[] = [...document.querySelectorAll<HTMLElement>('[data-scene]')].map((el) => {
    const id = el.dataset.scene ?? '';
    const module = el.dataset.module;
    return {
      el,
      id,
      palette: el.dataset.palette ?? id,
      pin: el.dataset.pin === undefined ? DEFAULT_PIN : Number(el.dataset.pin),
      load: module ? moduleLoader(module) : undefined,
      plans: [],
    };
  });

  const background = new Background(root);
  const stage: Stage = {
    lenis: null,
    scenes,
    restored: false,
    scrollTo(target, immediate = false) {
      const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY;
      if (stage.lenis) stage.lenis.scrollTo(y, { immediate, force: true, duration: 1.6 });
      else window.scrollTo({ top: y, behavior: immediate || conditions.reducedMotion ? 'auto' : 'smooth' });
    },
  };
  let current: gsap.Context | null = null;
  let conditions = { reducedMotion: false, mobile: false };

  const initScene = (scene: StageScene) => {
    if (!scene.module || !scene.ctx || !current) return;
    const { module, ctx } = scene;
    current.add(() => {
      const timeline = ctx.timeline;
      const result = module.init(ctx);
      const settle = () => {
        // Animaties die na het begin van de scroll zijn toegevoegd direct in de juiste stand zetten.
        // Zonder suppressEvents: helpers als de typemachine tekenen in hun onUpdate.
        const progress = timeline.progress();
        timeline.progress(0).progress(progress);
      };
      if (result instanceof Promise) result.then(settle);
      else settle();
    });
  };

  const load = (scene: StageScene) => {
    if (!scene.load || scene.loading) return;
    scene.loading = scene.load().then((mod) => {
      scene.module = mod.default;
      initScene(scene);
    });
  };

  // Lazy laden: een scherm vóórdat de scène in beeld komt.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const scene = scenes.find((s) => s.el === entry.target);
        if (scene) {
          scene.near = true;
          scene.plans.forEach((plan) => plan.activate());
          load(scene);
        }
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '100% 0px 100% 0px' },
  );

  const mm = gsap.matchMedia();
  mm.add(
    // GSAP draait dit alleen als minstens één voorwaarde klopt; mobile/desktop dekken samen alles.
    {
      reducedMotion: '(prefers-reduced-motion: reduce)',
      mobile: '(max-width: 47.99rem)',
      desktop: '(min-width: 48rem)',
    },
    (context) => {
      current = context;
      conditions = {
        reducedMotion: Boolean(context.conditions?.reducedMotion),
        mobile: Boolean(context.conditions?.mobile),
      };
      const { reducedMotion, mobile } = conditions;
      root.classList.toggle('reduced-motion', reducedMotion);

      const backgroundScenes: BackgroundScene[] = [];
      const plans: FlightPlan[] = [];
      const relayout = () => plans.forEach((plan) => plan.layout());
      ScrollTrigger.addEventListener('refresh', relayout);
      const onUpdate = () => background.update();

      for (const scene of scenes) {
        const pin = reducedMotion ? 0 : Math.round(scene.pin * (mobile ? MOBILE_FACTOR : 1));
        const pinned = pin > 0;

        // Tijdlijn van lengte 1. Gescrubd met de pin, of bij reduced motion: één keer afspelen.
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          paused: reducedMotion,
          scrollTrigger: reducedMotion
            ? { trigger: scene.el, start: 'top 75%', toggleActions: 'play none none none' }
            : pinned
              ? { trigger: scene.el, start: 'top top', end: `+=${pin}%`, pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate }
              : { trigger: scene.el, start: 'top top', end: 'bottom top', scrub: true, onUpdate },
        });
        timeline.set({}, {}, 1);
        if (reducedMotion) timeline.timeScale(1.5);

        // Binnenkomen: kleur van de vorige scène naar deze.
        const enter = ScrollTrigger.create({
          trigger: scene.el,
          start: 'top bottom',
          end: 'top top',
          onUpdate,
        });
        const play = timeline.scrollTrigger as ScrollTrigger | undefined;
        backgroundScenes.push({
          palette: scene.palette,
          enter: () => enter.progress,
          play: () => (reducedMotion || !play ? 1 : play.progress),
        });

        // Flight plan-lijn: tekent vanaf het binnenkomen van de scène tot het einde van de pin.
        // Een scène kan meerdere lagen hebben (bijv. één achter en één vóór de kaart).
        scene.plans = [];
        for (const svg of scene.el.querySelectorAll<SVGSVGElement>('[data-flight-plan]')) {
          if (!svg.parentElement) continue;
          const plan = new FlightPlan(svg, svg.parentElement);
          plans.push(plan);
          scene.plans.push(plan);
          if (scene.near) plan.activate();
          if (reducedMotion) plan.set(1);
          else if (svg.dataset.intro !== undefined) {
            const state = { p: 0 };
            gsap.to(state, { p: 1, duration: 1.6, delay: 0.6, ease: 'power2.inOut', onUpdate: () => plan.set(state.p) });
          } else {
            ScrollTrigger.create({
              trigger: scene.el,
              start: 'top bottom',
              end: () => (play && pinned ? play.end : (play?.end ?? 0)),
              onUpdate: (self) => plan.set(self.progress),
            });
          }
        }

        // UI (taalwisselaar, skip-knop) verbergen tijdens scènes met data-hide-ui (de Andes).
        if (scene.el.dataset.hideUi !== undefined && !reducedMotion) {
          ScrollTrigger.create({
            trigger: scene.el,
            start: 'top 40%',
            end: () => (play ? play.end - innerHeight * 0.3 : 0),
            toggleClass: { targets: root, className: 'ui-hidden' },
          });
        }

        scene.ctx = { el: scene.el, id: scene.id, lang, reducedMotion, mobile, timeline, lenis: () => stage.lenis };
        if (scene.module) initScene(scene);
      }

      background.setScenes(backgroundScenes);

      return () => {
        ScrollTrigger.removeEventListener('refresh', relayout);
        for (const scene of scenes) {
          if (scene.module && scene.ctx) scene.module.destroy?.(scene.ctx);
          scene.ctx = undefined;
        }
        current = null;
      };
    },
  );

  // Smooth scroll alleen zonder reduced motion. Op touch blijft het native scrollen.
  if (!conditions.reducedMotion) {
    const lenis = new Lenis({ autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    stage.lenis = lenis;
  }

  for (const scene of scenes) observer.observe(scene.el);

  // Na een taalwissel op dezelfde plek verdergaan.
  const fraction = takeScrollAfterSwitch();
  if (fraction !== null) {
    stage.restored = true;
    ScrollTrigger.refresh();
    const max = ScrollTrigger.maxScroll(window);
    if (stage.lenis) stage.lenis.scrollTo(fraction * max, { immediate: true, force: true });
    else window.scrollTo(0, fraction * max);
  }

  ScrollTrigger.addEventListener('refresh', () => background.update());

  // Fonts veranderen regelbreedtes en dus pin-afstanden.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return stage;
}
