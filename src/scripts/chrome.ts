// "Skip to details", "Replay our story" en het tweede bezoek (meteen naar de info).

import type { Stage } from './stage';

const VISITED_KEY = 'ni-visited';

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

  // Knop weg zodra de details in beeld zijn (en daarna).
  if (skip) {
    new IntersectionObserver(([entry]) => {
      if (!entry) return;
      const passed = entry.isIntersecting || entry.boundingClientRect.top < 0;
      skip.classList.toggle('is-hidden', passed);
    }).observe(details);
  }

  // Tweede bezoek: direct naar de info (tenzij er een taalwissel of #anker is).
  let visited = false;
  try {
    visited = localStorage.getItem(VISITED_KEY) === '1';
    localStorage.setItem(VISITED_KEY, '1');
  } catch {
    // Zonder opslag is elk bezoek het eerste.
  }
  if (visited && !restoredScroll && !location.hash) {
    requestAnimationFrame(() => stage.scrollTo(details, true));
  }
}
