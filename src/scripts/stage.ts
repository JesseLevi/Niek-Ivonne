// Het skelet van de scroll-film: Lenis (smooth scroll) gekoppeld aan GSAP ScrollTrigger,
// één tijdlijn en pin per scène, lazy loading van scène-modules en de achtergrondlaag.
//
// Markup: <section data-scene="lima" data-module="story" data-pin="200">
//   data-scene   id, en ook de kleurset uit tokens.css (tenzij data-palette)
//   data-module  bestandsnaam in src/scenes/ (zonder .ts); geen = alleen pin + kleur
//   data-pin     scrollafstand in % schermhoogte (standaard 200, 0 = niet vastpinnen)

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { isLocale, DEFAULT_LOCALE, type Locale } from '../lib/i18n';
import type { Scene, SceneContext, SceneModule } from '../scenes/types';
import { Background, type BackgroundScene } from './background';
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
}

export interface Stage {
  lenis: Lenis | null;
  scenes: StageScene[];
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
    };
  });

  const background = new Background(root);
  const stage: Stage = { lenis: null, scenes };
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
        const progress = timeline.progress();
        timeline.progress(0, true).progress(progress, true);
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
        if (scene) load(scene);
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
              ? { trigger: scene.el, start: 'top top', end: `+=${pin}%`, pin: true, scrub: true, anticipatePin: 1, onUpdate }
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

        scene.ctx = { el: scene.el, id: scene.id, lang, reducedMotion, mobile, timeline };
        if (scene.module) initScene(scene);
      }

      background.setScenes(backgroundScenes);

      return () => {
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
