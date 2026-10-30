# Testrapport mobiel en prestatiebudget (#15)

Stand: 30 oktober 2026. Getest in een headless Chromium (Playwright) en met Lighthouse 12; nog **niet** op echte toestellen.

## Wat is getest

| Onderdeel | Hoe | Resultaat |
| --- | --- | --- |
| Hele film doorscrollen | 390×844 (iPhone-formaat) en 1440×900, alle 15 secties, `en`/`es`/`nl` | Geen consolefouten; alle scènes pinnen, spelen af en terug |
| Reduced motion | `prefers-reduced-motion: reduce` | Geen pinning en geen smooth scroll; scènes onder elkaar als rustige fades |
| Dark mode | Systeeminstelling én rolluik (tik, slepen, toetsen) | Keuze blijft na herladen; nacht-uitzicht achter het rolluik |
| Taal | `/` met browsertaal `es-PE`, `nl-NL`, `fr-FR`; wisselen en herladen | Juiste taal, keuze onthouden, `?g=` gaat mee |
| Persoonlijke link | `/?g=familie-bakker` zonder eigen taalkeuze | Naar `/nl/`, begroeting op de splash, naam en aantal op de RSVP |
| Skip en herladen | Knop, herladen, `▶ Replay` | Springt naar de details; herladen en een tweede bezoek beginnen bovenaan; replay naar boven |
| RSVP | Gemockte Formspree-URL | Succes = stempel CONFIRMED (onthouden), fout = melding, offline = bewaard en verstuurd zodra online |
| Horizontale scroll | `scrollWidth` vs `clientWidth` | Geen horizontale overloop |

## Lighthouse (mobiel, gesimuleerde trage 4G en 4× CPU)

| | Eerste meting | Na optimalisatie |
| --- | --- | --- |
| Performance | 52 | 79–81 |
| Accessibility | 92 | 100 |
| Best practices | 96 | 100 |
| First Contentful Paint | 1,5 s | 1,0–1,4 s |
| Largest Contentful Paint | 4,7 s | 1,8–2,9 s |
| Total Blocking Time | 2.310 ms | 640–760 ms |
| Cumulative Layout Shift | 0 | 0 |

**Opgelost:** de flight plan-lijn werd voor alle 15 scènes tegelijk gemeten (veel geforceerde layout). Nu pas als een scène dichtbij is, en eerst meten, dan schrijven. Verder: `aria-label` op `<p>` vervangen door een verborgen tekstkopie, taallinks zonder afwijkende naam, contrast van de tijdstempels in de chat, ontbrekende favicon.

**Nog open:** de resterende blokkeertijd komt vooral van het opbouwen van 15 vastgepinde ScrollTriggers en SplitText bij het laden (Style & Layout ±2,4 s bij 4× CPU). Mogelijke vervolgstap: scènes verder weg pas pinnen als ze dichtbij komen.

## Prestatiebudget

- **Eerste download: ±740 KB** (budget 1,5 MB). Daarvan JavaScript ±57 KB gzip (GSAP, ScrollTrigger, Lenis, het scroll-fundament en de splash), fonts 74 KB, de rest illustraties.
- Alleen de splash-module zit in de eerste bundel; andere scènes laden een scherm vooraf.
- Alle illustraties zijn WebP onder 300 KB; het grootste is Mas Terrats (257 KB).

## Nog te doen op echte toestellen

- [ ] iPhone (Safari) en Android (Chrome) via een gedeelde link: adresbalk in/uit zonder sprongen (`svh`, `ignoreMobileResize`)
- [ ] Pinning en scrollen met de duim; Lenis laat touch native scrollen
- [ ] Rolluik slepen op iOS (de greep onderaan het rolluik vangt de veeg, de rest van het raam scrollt de pagina)
- [ ] Reduced motion aan op het toestel
- [ ] WhatsApp-preview (OG-beeld) op iOS en Android, zodra er een domein is
