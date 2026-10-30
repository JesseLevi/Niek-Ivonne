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

## Illustraties

De ChatGPT-illustraties staan als WebP met transparantie in `public/images/` en zijn beschreven in `src/content/images.yml` (afmetingen en alt-tekst per taal); `<Illustration id="05-lima" lang={lang} />` toont er één met gereserveerde ruimte. Opnieuw maken uit de originele PNG's:

```bash
pip install "rembg[cpu]" pillow numpy
python scripts/process-illustrations.py pad/naar/Images
```

Het script stelt vrij (rembg), vult ingesloten vlakken weer op (het uitzicht door het Lima-raam, het telefoonscherm), zet de telefoon rechtop, splitst de ringdoosjes en maakt van het vliegtuigraam passende lagen: kozijn, glasmasker, rolluik en drie uitzichten. Losse beelden vervangen kan ook via Pages CMS › Illustraties, met dezelfde beeldverhouding. De build faalt als een `src` niet bestaat. Voor nieuwe assets zonder beeld maakt `npm run placeholders` SVG-placeholders.

## Scroll-fundament

`src/scripts/stage.ts` koppelt Lenis aan GSAP ScrollTrigger en maakt per `<section data-scene>` één tijdlijn van lengte 1:

| Attribuut | Betekenis |
| --- | --- |
| `data-scene` | Id; ook de kleurset uit `tokens.css` (`--scene-<id>-bg/-ink/-accent`, extra stops `-2-`, `-3-`) |
| `data-module` | Module in `src/scenes/` die de animaties bouwt (`init(ctx)` / `destroy(ctx)`) |
| `data-pin` | Scrollafstand in % schermhoogte (standaard 200, op mobiel ×0,75; `0` = niet vastpinnen) |

Alleen `src/scenes/splash.ts` zit in de eerste bundel; andere modules worden een scherm vóór de scène geladen (dynamic import). De achtergrond is één vaste laag (`--color-bg`) die tussen scènes in OKLCH meeschuift, ook terug. Met `prefers-reduced-motion` is er geen pinning en geen smooth scroll: de scènes staan onder elkaar en spelen als rustige fades af. Er is geen horizontale scroll-hijack.

## Tekstanimaties

`src/scripts/text.ts` bevat de helpers uit het concept: `lineReveal` (regel uit masker, 80 ms na elkaar), `wordBlur`, `splitFlap` (vertrekbord), `typewriter` en `counter` (getallen per taal opgemaakt). Elke helper geeft een GSAP-tijdlijn terug die je met `place(ctx.timeline, helper(el), positie, lengte)` in een scène hangt; alles werkt met scrub, ook terug, en wordt een rustige fade bij reduced motion. Demo: `/en/lab/`, `/es/lab/`, `/nl/lab/` (niet gelinkt vanaf de site).
