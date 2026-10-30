// Gedeelde bouwstenen voor verhaalscènes: label, vertrekbord en de regels uit story.yml
// laten binnenkomen. Als module ook bruikbaar voor een scène zonder eigen beeldregie.

import { isLocale } from '../lib/i18n';
import { counter, lineReveal, place, splitFlap, typewriter, wordBlur } from '../scripts/text';
import type { Scene, SceneContext } from './types';

export interface LineOptions {
  /** Woord-fade met blur in plaats van regel-reveal (emotionele zinnen). */
  blur?: boolean;
}

/**
 * Laat de regels in `root` één voor één binnenkomen tussen `start` en `end` (scène-tijd).
 * Elke regel is een stap; `pause` in story.yml voegt een lege stap toe.
 * Geeft per regel het tijdstip terug, zodat een scène er beeld op kan afstemmen.
 */
export function animateLines(
  ctx: SceneContext,
  root: ParentNode,
  start: number,
  end: number,
  options: LineOptions = {},
): number[] {
  const { timeline, reducedMotion, lang } = ctx;
  const textOptions = { reducedMotion };
  const lines = [...root.querySelectorAll<HTMLElement>('[data-line]')];
  const steps = lines.reduce((n, line) => n + 1 + (line.dataset.pause !== undefined ? 1 : 0), 0);
  const step = (end - start) / Math.max(steps, 1);
  const times: number[] = [];
  let at = start;
  for (const line of lines) {
    if (line.dataset.pause !== undefined) at += step;
    times.push(at);
    const counters = [...line.querySelectorAll<HTMLElement>('[data-counter]')];
    if (counters.length) {
      // Regels met een teller als geheel binnenhalen; de teller loopt daarna op.
      timeline.from(line, { autoAlpha: 0, y: reducedMotion ? 0 : 16, duration: step * 0.4, ease: 'power2.out' }, at);
      for (const span of counters) {
        place(
          timeline,
          counter(span, {
            ...textOptions,
            to: Number(span.dataset.to),
            plus: span.dataset.plus !== undefined,
            steps: span.dataset.steps?.split(',').map(Number),
            lang: isLocale(lang) ? lang : 'en',
          }),
          at,
          step * 0.9,
        );
      }
    } else if (line.dataset.style === 'mono') {
      place(timeline, typewriter(line, textOptions), at, step * 0.6);
    } else if (options.blur) {
      place(timeline, wordBlur(line, textOptions), at, step * 0.9);
    } else {
      place(timeline, lineReveal(line, textOptions), at, step * 0.8);
    }
    at += step;
  }
  return times;
}

/** Mono-label (typemachine) en vertrekbord (split-flap) bovenaan een scène. */
export function animateMeta(ctx: SceneContext, root: ParentNode, at = 0): void {
  const { timeline, reducedMotion } = ctx;
  const label = root.querySelector<HTMLElement>('[data-scene-label]');
  const board = root.querySelector<HTMLElement>('[data-place]');
  if (label) place(timeline, typewriter(label, { reducedMotion }), at, 0.06);
  if (board) {
    const words = [board.dataset.from || ' ', (board.dataset.text ??= board.textContent?.trim() ?? '')];
    // Tijdens het binnenschuiven nog leeg; pas als de scène staat verschijnt het bord en klappert het
    // van de vorige plaats naar deze.
    timeline.fromTo(board, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, at);
    place(timeline, splitFlap(board, words, { reducedMotion }), at + 0.02, 0.1);
  }
}

const story: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    animateMeta(ctx, el);
    const image = el.querySelector('.illustration');
    if (image) timeline.from(image, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.94, duration: 0.15 }, 0);
    animateLines(ctx, el, 0.1, 0.8);
  },
};

export default story;
