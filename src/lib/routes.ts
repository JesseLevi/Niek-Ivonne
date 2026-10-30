import { isLocale, LOCALES, type Locale } from './i18n';

/** `/es/lab/text/` → `/lab/text/`; paden zonder taal blijven gelijk. */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (!isLocale(first)) return pathname;
  return `/${rest.join('/')}`;
}

/** Hetzelfde pad in een andere taal: `('/lab/text/', 'nl')` → `/nl/lab/text/`. */
export function localizedPath(path: string, lang: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean === '/' ? '/' : clean}`;
}

/** `getStaticPaths` voor pagina's onder `src/pages/[lang]/`. */
export function localeStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang }, props: { lang } }));
}
