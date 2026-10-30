// Persoonlijke uitnodiging via ?g=<slug> (guests.yml). Onbekende slug: gewone site, geen melding.
// De gegevens staan als JSON in de pagina (<script type="application/json" id="guest-data">).

export interface GuestInfo {
  name: string;
  language: string;
  party_size: number;
  greeting: string;
}

const SESSION_KEY = 'ni-guest';

function readGuests(): Record<string, GuestInfo> {
  const el = document.getElementById('guest-data');
  try {
    return el?.textContent ? (JSON.parse(el.textContent) as Record<string, GuestInfo>) : {};
  } catch {
    return {};
  }
}

/** De gast van deze bezoeker: uit ?g=, of eerder in deze sessie. */
export function currentGuest(): GuestInfo | null {
  const guests = readGuests();
  let slug = new URLSearchParams(location.search).get('g');
  try {
    if (slug && guests[slug]) sessionStorage.setItem(SESSION_KEY, slug);
    else slug = sessionStorage.getItem(SESSION_KEY);
  } catch {
    // Zonder opslag werkt alleen de link zelf.
  }
  return slug ? (guests[slug] ?? null) : null;
}

/** Begroeting op de splash. */
export function showGreeting(): void {
  const guest = currentGuest();
  const el = document.querySelector<HTMLElement>('[data-guest-greeting]');
  if (!guest || !el) return;
  el.textContent = guest.greeting;
  el.hidden = false;
}
