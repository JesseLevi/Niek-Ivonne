// Talen en opmaak. Bevat geen content, zodat het ook in de browser bruikbaar is.

export const LOCALES = ['en', 'es', 'nl'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Opslag-sleutel voor de taalkeuze in localStorage. */
export const LOCALE_STORAGE_KEY = 'ni-lang';

/** Intl-locale per taal. Spaans is Latijns-Amerikaans. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-GB',
  es: 'es-419',
  nl: 'nl-NL',
};

export type Translated = Record<Locale, string>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function formatNumber(value: number, lang: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[lang]).format(value);
}

/** Vervangt `{naam}` door de bijbehorende waarde. Onbekende tokens blijven staan. */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** Alle `{tokens}` in een tekst. */
export function tokensIn(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1] ?? '');
}

/** Een ISO-datum (`2027-09-08`) als Date om 12:00 UTC, zodat tijdzones de dag niet verschuiven. */
export function parseDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** Bijv. "woensdag 8 september 2027". */
export function formatLongDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: 'full', timeZone: 'UTC' }).format(
    parseDate(iso),
  );
}

/** Bijv. "8 september 2027". */
export function formatDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: 'long', timeZone: 'UTC' }).format(
    parseDate(iso),
  );
}

/** Bijv. "SEPTEMBER 2027" / "SEPTIEMBRE 2027", voor de mono-regels. */
export function formatMonthYear(iso: string, lang: Locale): string {
  const parts = new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(parseDate(iso));
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  return `${month} ${year}`.toLocaleUpperCase(INTL_LOCALE[lang]);
}
