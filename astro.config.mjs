// @ts-check
import { defineConfig } from 'astro/config';

// Publieke URL, nodig voor absolute og:image- en hreflang-links (WhatsApp-preview).
// Zet SITE_URL (bijv. https://niekenivonne.nl); anders de URL die Vercel of Netlify meegeeft.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
  process.env.URL;

// Volledig statische site. Deploy: Vercel of Netlify, output in dist/.
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});
