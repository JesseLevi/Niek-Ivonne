# Niek & Ivonne

Trouwwebsite als scroll-film. Concept en storyboard: [`docs/concept.md`](docs/concept.md). Werkafspraken: [`CLAUDE.md`](CLAUDE.md).

## Lokaal draaien

Vereist Node.js 22.12 of nieuwer.

```bash
npm install
npm run dev       # ontwikkelserver op http://localhost:4321
npm run build     # statische site in dist/
npm run preview   # bekijk de build lokaal
npm run check     # TypeScript, Astro en Pages CMS-config controleren
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

## Content

Alle tekst en data staat in `src/content/*.yml` (bewerkbaar via Pages CMS) en wordt bij de build gevalideerd met zod (`src/lib/schema.ts`). Een fout, zoals een ontbrekende vertaling of een onbekend `{token}`, laat `npm run build` falen met een melding die het bestand en het veld noemt.

| Bestand | Inhoud |
| --- | --- |
| `site.yml` | Namen, datum, locatie, RSVP-deadline en -URL, OG-tekst |
| `story.yml` | Scènes met regels in `en`/`es`/`nl`, verrassingen, chat, aftiteling |
| `stats.yml` | Tellers: km, appjes, vluchten (in teksten als `{distance}`, `{messages}`, `{flights}`, `{flown_km}`) |
| `info.yml` | Programma, reizen, overnachten, dresscode, cadeaus, FAQ |
| `ui.yml` | Labels en knoppen |
| `guests.yml` | Persoonlijke links (`?g=slug`). Repo is publiek: geen gevoelige gegevens |
| `images.yml` | Illustraties met afmetingen en alt-tekst |

Mock data is gemarkeerd met `# TODO`. Teksten aanpassen via Pages CMS: zie [`docs/cms.md`](docs/cms.md).

## Fonts

Self-hosted WOFF2 in `public/fonts/` (samen ±75 KB): Instrument Serif (regular + cursief), Inter (variabel, 400–600) en IBM Plex Mono (400 + 500). Gesubset op Latin plus Spaanse tekens en de pijlen uit de luchtvaartlabels. Opnieuw maken: `scripts/subset-fonts.sh` (vereist `pip install fonttools brotli`). Alleen de serif cursief en de mono worden gepreload.

## Talen

Routes `/en/`, `/es/` en `/nl/` (`src/pages/[lang]/`). `/` stuurt door naar de eerder gekozen taal (localStorage `ni-lang`), anders de browsertaal, anders Engels; query en hash (zoals `?g=…`) gaan mee. De wisselaar `EN · ES · NL` rechtsboven onthoudt de keuze en houdt de scrollpositie vast. Elke pagina heeft `lang` en `hreflang`-links; zet `site` in `astro.config.mjs` zodra het domein bekend is, dan worden die absoluut.
