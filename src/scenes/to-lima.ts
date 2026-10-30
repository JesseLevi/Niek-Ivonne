// Scène 9: de lange lijn AMS → LIM, het vliegtuig vliegt mee, en per woordgroep verschijnen
// de stoeltjes: samen (zij en hij), zijn ouders, de tweelingbroer.

import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { animateLines, animateMeta } from './story';
import type { Scene } from './types';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/** Verdeel `count` stoelen over `groups` regels, eerst de grootste groepen (2, 2, 1). */
function groupSizes(count: number, groups: number): number[] {
  const sizes: number[] = [];
  let left = count;
  for (let i = groups; i > 0; i--) {
    const size = Math.ceil(left / i);
    sizes.push(size);
    left -= size;
  }
  return sizes;
}

const toLima: Scene = {
  init(ctx) {
    const { el, timeline, reducedMotion } = ctx;
    const arc = el.querySelector<SVGPathElement>('[data-arc]');
    const plane = el.querySelector<HTMLElement>('[data-plane]');
    const seats = [...el.querySelectorAll<HTMLElement>('[data-seat]')];

    animateMeta(ctx, el, 0);
    if (arc) {
      if (reducedMotion) timeline.from(arc, { autoAlpha: 0, duration: 0.1 }, 0.05);
      else timeline.fromTo(arc, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.75, ease: 'none' }, 0.05);
    }
    if (plane && arc && !reducedMotion) {
      timeline.fromTo(
        plane,
        { motionPath: { path: arc, align: arc, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: 0 } },
        { motionPath: { path: arc, align: arc, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: 1 }, duration: 0.75, ease: 'none' },
        0.05,
      );
    } else if (plane) {
      gsap.set(plane, { autoAlpha: 0 });
    }

    const times = animateLines(ctx, el, 0.1, 0.85);
    // Eerste regel = de vlucht; dan per regel een groep stoeltjes: samen (zij en hij),
    // zijn ouders, de tweelingbroer. De slotregel ("naar haar familie") krijgt geen stoeltjes.
    const SEAT_LINES = 3;
    const sizes = groupSizes(seats.length, Math.min(SEAT_LINES, Math.max(times.length - 1, 1)));
    let index = 0;
    sizes.forEach((size, group) => {
      const at = times[group + 1] ?? times[times.length - 1] ?? 0.5;
      timeline.from(seats.slice(index, index + size), { autoAlpha: 0, y: reducedMotion ? 0 : 10, scale: reducedMotion ? 1 : 0.6, duration: 0.05, stagger: 0.03, ease: 'back.out(2)' }, at);
      index += size;
    });
  },
};

export default toLima;
