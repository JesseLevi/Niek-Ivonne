# Niek & Ivonne

Trouwwebsite als scroll-film. Concept en storyboard: [`docs/concept.md`](docs/concept.md). Werkafspraken: [`CLAUDE.md`](CLAUDE.md).

## Lokaal draaien

Vereist Node.js 22.12 of nieuwer.

```bash
npm install
npm run dev       # ontwikkelserver op http://localhost:4321
npm run build     # statische site in dist/
npm run preview   # bekijk de build lokaal
npm run check     # TypeScript- en Astro-controle
```

## Mappen

| Map | Inhoud |
| --- | --- |
| `src/content/` | Alle tekst en data (YAML, bewerkbaar via Pages CMS) |
| `src/scenes/` | Eén TS-module per scène |
| `src/styles/` | Design tokens en globale stijl |
| `src/pages/` | Routes |
| `public/images/` | Illustraties |

## Niet indexeren

De site is privé: elke pagina heeft `<meta name="robots" content="noindex, nofollow">`, `robots.txt` blokkeert alles en Vercel (`vercel.json`) en Netlify (`public/_headers`) sturen een `X-Robots-Tag`-header mee.
