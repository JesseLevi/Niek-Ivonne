// Taalwisselaar: keuze onthouden en op dezelfde plek in het verhaal verdergaan.

import { isLocale, LOCALE_STORAGE_KEY } from '../lib/i18n';

const SCROLL_KEY = 'ni-scroll-after-switch';

export function saveLocale(lang: string): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lang);
  } catch {
    // Privémodus of opslag uitgeschakeld: dan geldt de keuze alleen voor deze pagina.
  }
}

export function initLanguageSwitcher(): void {
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-language-switcher] a[data-lang]')) {
    link.addEventListener('click', () => {
      const lang = link.dataset.lang;
      if (!isLocale(lang)) return;
      saveLocale(lang);
      // Query (bijv. ?g=familia-rojas) en hash meenemen.
      link.search = location.search;
      link.hash = location.hash;
      try {
        const max = document.documentElement.scrollHeight - innerHeight;
        sessionStorage.setItem(SCROLL_KEY, String(max > 0 ? scrollY / max : 0));
      } catch {
        // Niet erg: dan begint de nieuwe taal bovenaan.
      }
    });
  }
}

/**
 * Scrollpositie (als fractie van de pagina) na een taalwissel, eenmalig.
 * Het scroll-fundament roept dit aan zodra de layout staat.
 */
export function takeScrollAfterSwitch(): number | null {
  try {
    const value = sessionStorage.getItem(SCROLL_KEY);
    sessionStorage.removeItem(SCROLL_KEY);
    if (value === null) return null;
    const fraction = Number(value);
    return Number.isFinite(fraction) ? Math.min(Math.max(fraction, 0), 1) : null;
  } catch {
    return null;
  }
}
