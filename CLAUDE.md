# Trouwwebsite Niek & Ivonne

One-page scroll-film die het verhaal van Niek en Ivonne vertelt en eindigt bij hun bruiloft. Lees **eerst `docs/concept.md`**: daar staan het storyboard (12 scènes), kleurverloop, tekstanimaties, illustratielijst en techniek. Dit bestand is de samenvatting en de werkafspraken.

## Vaste feiten

- **Ivonne** komt uit Lima, Peru. Verhuisde naar Barcelona voor studie en daarna werk.
- **Niek** is Nederlands, deed zijn Erasmus in Barcelona. Hij heeft een **tweelingbroer**.
- Ze werden huisgenoten in Barcelona. Geen vonk meteen; toen Niek terug naar Nederland ging, begonnen ze veel te appen. Hij ging terug op bezoek en ze werden verliefd.
- Jaren heen en weer gevlogen. In **2025** verhuisde Ivonne naar Amsterdam.
- In **2026** gingen ze met Nieks ouders en tweelingbroer naar Peru om haar ouders te bezoeken. Niek vroeg haar ten huwelijk met de Peruaanse bergen op de achtergrond.
- Bruiloft: **september 2027**, **Mas Terrats**, Pontós (Alt Empordà, Girona, Spanje). Let op de spelling: Mas Terrats.

## Talen

- `en` (standaard), `es`, `nl`. Keuze onthouden in localStorage, wisselbaar via `EN · ES · NL` rechtsboven.
- Spaans = Latijns-Amerikaans (`ustedes`, nooit `vosotros`).
- Ontwerp tekstblokken op de langste taal (meestal Spaans, ±25% langer).

## Stack

- **Astro**, volledig statisch. Deploy naar Vercel of Netlify.
- **GSAP** met ScrollTrigger, SplitText, DrawSVG en MotionPath (alle plugins zijn gratis). **Lenis** voor smooth scroll.
- Achtergrondkleur: één CSS-variabele op een vaste laag, getweend in **OKLCH** (niet RGB).
- Geen UI-framework nodig; vanilla TS-modules per scène is prima.

## Content en Pages CMS

**Alle tekst en data komt uit contentbestanden. Niets hardcoden in componenten.** De bestanden zijn bewerkbaar via [Pages CMS](https://pagescms.org), geconfigureerd in `.pages.yml` in de root.

Voorstel contentmodel (vertalingen per veld naast elkaar, zodat je in de CMS één scène in drie talen tegelijk bewerkt):

| Bestand | Type in Pages CMS | Inhoud |
| --- | --- | --- |
| `src/content/site.yml` | file | Namen, datum, locatie, plaats, RSVP-deadline, RSVP-formulier-URL, OG-tekst |
| `src/content/story.yml` | file met lijst | Scènes: `id`, `label` (mono), `lines[]` met `{ en, es, nl }` en een `style` (`serif`, `body`, `mono`) |
| `src/content/stats.yml` | file | Tellers: km, appjes, vluchten |
| `src/content/info.yml` | file met lijsten | Programma (tijd + titel + beschrijving), reizen, overnachten, dresscode, cadeautips, FAQ — alles met `{ en, es, nl }` |
| `src/content/ui.yml` | file | Labels en knoppen per taal (`SCROLL TO BOARD`, `SKIP TO DETAILS`, RSVP-velden) |
| `src/content/guests.yml` | file met lijst | Persoonlijke links: `slug`, `greeting` per taal, `language`, `party_size` |
| `public/images/` | media | Illustraties (PNG/WebP) |

**Mock data:** vul alles met plausibele placeholderdata en markeer het met `# TODO` in de YAML. Gebruik als mockdatum zaterdag **18 september 2027** en de voorbeeldteksten uit `docs/concept.md` (sectie Tekst en tone of voice). Vertaal ze naar `es` en `nl`.

**Placeholder-beelden:** zolang de ChatGPT-illustraties er niet zijn, gebruik je simpele SVG-placeholders op crème met de assetnaam erin (bijv. `05-lima.svg`), zodat je ze later 1-op-1 vervangt.

**Privacy:** de repo is **publiek** (`github.com/JesseLevi/Niek-Ivonne`). Alles wat je commit, inclusief `guests.yml`, is dus voor iedereen leesbaar: zet er geen adressen, telefoonnummers of andere gevoelige gegevens in. De site krijgt `noindex`.

## Werkwijze en tickets

- Werk gebeurt via de GitHub-repo; push elke stap naar `main` (of een branch + PR bij grotere stappen).
- Alle taken staan als issues in het GitHub Project **Trouwwebsite Niek & Ivonne**. Verwijs in commits naar het issue (`#12`) en sluit het issue als de stap is goedgekeurd.

## Bouwvolgorde

1. Project opzetten, contentmodel, `.pages.yml`, mock data, design tokens (kleuren uit concept.md), fonts (Instrument Serif, Inter, een mono).
2. **Splash**: vliegtuigraam, rolluik dat dark mode schakelt, namen, datum, taalwisselaar.
3. **Scène 1**: wereldkaart, twee pins, km-teller, de gestippelde flight plan-lijn die door de hele pagina loopt.
4. **Scène 8**: het grote platte vliegtuig dat door de achtergrond trekt terwijl tekst binnenkomt.
5. Testen op mobiel (iOS Safari). Daarna pas de overige scènes, dan info + RSVP.

Stop na elke stap, laat het resultaat zien en wacht op feedback voordat je verdergaat.

## Werkafspraken

- **Mobiel eerst.** Elke scène staand ontwerpen; `svh`-eenheden; geen horizontale scroll-hijacks.
- `prefers-reduced-motion`: dezelfde scènes als rustige fades, zonder pinning.
- Alle verhaaltekst is echte HTML-tekst, nooit in afbeeldingen.
- Kleuren alleen via tokens in één bestand.
- Alleen de splash meteen laden, de rest lazy per scène. Eerste download onder 1,5 MB.
- Kleine, beschrijvende commits per stap.

## Open vragen (nog niet bekend, mock gebruiken)

Achternamen, exacte datum en programma, jaar van huisgenoten en eerste bezoek, echte eerste appjes, aantal vluchten, plek van het aanzoek, overnachtingen, dresscode, RSVP-deadline, gastenlijst.
