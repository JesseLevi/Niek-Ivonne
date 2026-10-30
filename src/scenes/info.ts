// Praktische info en RSVP: geen scroll-animaties, alleen zachte fades bij binnenkomen.

import type { Scene } from './types';

const observers = new WeakMap<HTMLElement, IntersectionObserver>();

export function fadeIn(el: HTMLElement): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  el.querySelectorAll('[data-fade]').forEach((node) => observer.observe(node));
  return observer;
}

const info: Scene = {
  init({ el }) {
    observers.get(el)?.disconnect();
    observers.set(el, fadeIn(el));
  },
  destroy({ el }) {
    observers.get(el)?.disconnect();
  },
};

export default info;
