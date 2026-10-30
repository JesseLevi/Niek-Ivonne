// RSVP: naam en aantal vooringevuld bij een persoonlijke link, versturen naar het formulier
// (Formspree-compatibel), afstempelen bij succes. Offline: bewaren en versturen zodra er weer
// verbinding is. Eenmaal verstuurd blijft de kaart afgestempeld (localStorage).

import { currentGuest } from '../scripts/guest';
import { fadeIn } from './info';
import type { Scene } from './types';

const QUEUE_KEY = 'ni-rsvp-queue';
const DONE_KEY = 'ni-rsvp-done';

type Payload = Record<string, string>;

function store(key: string, value: Payload | null): void {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // Opslag uit: dan geen wachtrij of onthouden stempel.
  }
}

function read(key: string): Payload | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Payload) : null;
  } catch {
    return null;
  }
}

async function send(url: string, payload: Payload): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`RSVP: ${response.status}`);
}

let ready = false;

const rsvp: Scene = {
  init({ el }) {
    fadeIn(el);
    const form = el.querySelector<HTMLFormElement>('[data-rsvp]');
    if (!form || ready) return;
    ready = true;

    const status = form.querySelector<HTMLElement>('[data-status]');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const messages = JSON.parse(form.dataset.messages ?? '{}') as Record<string, string>;
    const url = form.getAttribute('action') ?? '';

    const confirm = (payload: Payload) => {
      store(DONE_KEY, payload);
      store(QUEUE_KEY, null);
      form.classList.add('is-confirmed');
      if (status) status.textContent = '';
      if (button) button.textContent = messages.submit ?? '';
    };

    // Persoonlijke link: naam en aantal invullen.
    const guest = currentGuest();
    const slug = new URLSearchParams(location.search).get('g') ?? '';
    const nameInput = form.querySelector<HTMLInputElement>('[data-guest-name]');
    const partyInput = form.querySelector<HTMLInputElement>('[data-guest-party]');
    const slugInput = form.querySelector<HTMLInputElement>('[data-guest-slug]');
    if (guest) {
      if (nameInput && !nameInput.value) nameInput.value = guest.name;
      if (partyInput) partyInput.value = String(guest.party_size);
      if (slugInput) slugInput.value = slug;
    }

    // Al eerder verstuurd: stempel staat er al.
    const done = read(DONE_KEY);
    if (done) {
      for (const [key, value] of Object.entries(done)) {
        const field = form.elements.namedItem(key);
        if (field instanceof HTMLInputElement && field.type !== 'radio') field.value = value;
      }
      form.classList.add('is-confirmed');
    }

    const trySend = async (payload: Payload) => {
      if (!url) return;
      if (button) {
        button.disabled = true;
        button.textContent = messages.sending ?? '';
      }
      try {
        if (!navigator.onLine) throw new TypeError('offline');
        await send(url, payload);
        confirm(payload);
      } catch (error) {
        const offline = error instanceof TypeError;
        if (offline) store(QUEUE_KEY, payload);
        if (status) status.textContent = (offline ? messages.offline : messages.error) ?? '';
        if (button) {
          button.disabled = false;
          button.textContent = messages.submit ?? '';
        }
      }
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const payload = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v)]));
      void trySend(payload);
    });

    // Wachtrij versturen zodra er weer verbinding is.
    const retry = () => {
      const queued = read(QUEUE_KEY);
      if (queued && !read(DONE_KEY)) void trySend(queued);
    };
    addEventListener('online', retry);
    retry();
  },
};

export default rsvp;
