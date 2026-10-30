// "Skip to details" en "Replay our story", en: elk bezoek begint bovenaan.

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Stage } from './stage';

export function initChrome(stage: Stage, restoredScroll: boolean): void {
  const details = document.getElementById('details');
  const skip = document.querySelector<HTMLElement>('[data-skip]');
  const replay = document.querySelector<HTMLElement>('[data-replay]');
  if (!details) return;

  skip?.addEventListener('click', (event) => {
    event.preventDefault();
    stage.scrollTo(details);
  });
  replay?.addEventListener('click', () => stage.scrollTo(0, true));

  // Knop weg zodra de details in beeld zijn (en daarna), ook na een sprong voorbij de details.
  if (skip) {
    let frame = 0;
    const update = () => {
      frame = 0;
      skip.classList.toggle('is-hidden', details.getBoundingClientRect().top < innerHeight * 0.9);
    };
    addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true });
    update();
  }

  // Altijd bovenaan beginnen, ook bij herladen of een tweede bezoek; mobiele browsers
  // zetten anders soms de oude scrollpositie terug. Uitzonderingen: een #anker (bijv.
  // #details) en een taalwissel, die bewust op dezelfde plek in het verhaal verdergaat.
  if (!restoredScroll && !location.hash) {
    // ScrollTrigger onthoudt zelf ook de scrollpositie en zet die terug bij een refresh.
    ScrollTrigger.clearScrollMemory('manual');
    const toTop = () => {
      window.scrollTo(0, 0);
      stage.scrollTo(0, true);
    };
    toTop();
    // Sommige browsers herstellen de positie pas na 'load' of na het laden van de fonts.
    addEventListener('load', toTop, { once: true });
    document.fonts?.ready.then(toTop);
  }
}
