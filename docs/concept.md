# Trouwwebsite Niek & Ivonne — concept & storyboard

Versie 30 oktober 2026. Bron: het concept-doc in Claude.

## Kernidee

De site is een korte film in twaalf scènes die je met je scrollwiel afspeelt: twee stippen op een wereldkaart, 10.500 km uit elkaar, die elkaar vinden in Barcelona en eindigen op één plek in Girona, september 2027.

De beeldtaal van Mike (mikes.cv) blijft leidend: crème papier, per scène één zacht skeuomorf object in het midden, en platte blauwe lijnen en iconen voor alles wat beweegt. Het ritme is filmisch: elke scène wordt vastgepind, het beeld speelt zich af, tekst komt regel voor regel binnen, en pas daarna scroll je verder.

**Rode draad: de flight plan-lijn.** Net als bij Mike loopt er een gestippelde route van boven naar beneden door de hele pagina. Die lijn ís hun verhaal. Hij begint als twee losse lijnen (Lima en Nederland), smelt samen in Barcelona, wordt een zigzag van heen-en-weer vliegen, maakt een lus rond de ring in Peru en eindigt in één stip op Mas Terrats.

**Tweede draad: het raam als lens.** Het vliegtuigraam uit de splash komt terug als kader. Elke plek bekijk je door een raam dat daar hoort: de persiana van een Barcelonees balkon, een grachtenpandraam in Amsterdam, het vliegtuigraam boven de Andes. Het rolluik van het raam is meteen je scèneovergang én je dark-mode-schakelaar.

## Visuele taal

Drie lagen die nooit door elkaar lopen: skeuomorfe objecten voor emotie, platte lijnen voor beweging, en typografie voor het verhaal.

| Laag | Wat | Stijl | Gemaakt met |
| --- | --- | --- | --- |
| Objecten | Raam, wereldkaart, deurbel, telefoon, koffer, ringdoosje | Zachte productrender, mat, licht van linksboven, korte zachte schaduw op crème | ChatGPT, vrijgesteld als PNG |
| Plekken | Lima, Barcelona, Amsterdam, Andes, Mas Terrats | Zelfde render-stijl, als klein diorama of gezien door een raam | ChatGPT, de Andes als losse platte lagen in SVG |
| Beweging | Vliegtuig, gestippelde routes, pins, iconen | Plat, monoline, één accentkleur (Mike-blauw) | SVG in code |
| Tekst | Namen, verhaal, labels | Serif voor emotie, grotesk voor lopende tekst, mono voor labels | Webfonts |

**Kleur.** Basis is crème papier (#F5F1EC) met warme inkt (#2A2622) en één accent: vliegtuigblauw (#3B4FD8). Per scène verschuift de achtergrond naar de kleur van die plek; zie Kleurverloop.

**Typografie.**

- **Display serif** voor namen en de zinnen die moeten raken, bij voorkeur cursief: bijvoorbeeld Instrument Serif of Fraunces.
- **Grotesk** voor lopende tekst, zoals bij Mike: Inter of Geist, rustig en klein.
- **Mono** voor labels in luchtvaarttaal: `LIM → BCN`, coördinaten, `GATE 2027`, `ONE WAY`. Dit is het Mike-detail dat het vliegthema draagt zonder kitsch.

**Regel:** alles met tekst, alles wat vertaald moet worden en alles wat beweegt, bouw je in code. ChatGPT maakt alleen stilstaande objecten en plekken zonder tekst.

## Storyboard

Twaalf scènes plus informatie en RSVP. Zij is Ivonne, hij is Niek. Elke scène is vastgepind (pinned) en speelt over ongeveer 150 tot 250% schermhoogte af.

### 0. Splash: boarding

- **Beeld:** het vliegtuigraam gecentreerd, zoals bij Mike. Door het glas zie je wolken in ochtendlicht.
- **Tekst:** hun namen in grote cursieve serif, daaronder in mono: `GIRONA · SEPTEMBER 2027 · MAS TERRATS`.
- **Interactie:** sleep of klik het rolluik dicht en het wordt nacht: sterren achter het glas, de hele site in dark mode.
- **Scrollhint:** klein mono-label `SCROLL TO BOARD` met een gestippelde lijn die naar beneden begint te lopen.

### 1. Twee plekken

- **Overgang:** de camera duikt door het glas; de wolken trekken open.
- **Beeld:** een wereldkaart als reliëfobject (gegoten gips of geperst papier) in dezelfde stijl als het raam. Twee pins pulseren: Lima en Nederland.
- **Tekst:** "This story begins in two places." Daarna een teller die oploopt tot `10,528 km`.
- **Achtergrond:** iets koeler papier.

### 2. Lima

- **Overgang:** de kaart zoomt in op de Lima-pin.
- **Beeld:** de kliffen van Miraflores boven de Pacific, bougainvillea, gezien door een koloniaal houten raam.
- **Tekst:** wie zij is, in twee korte regels. Dan trekt er een gestippelde lijn uit Lima over de oceaan: "She packs her life into two suitcases. Destination: Barcelona."
- **Achtergrond:** zacht zand naar terracotta.

### 3. Nederland

- **Beeld:** platte polder, een fiets, een strakke horizon met wolken. Twee identieke figuurtjes: hij en zijn tweelingbroer.
- **Tekst:** "Meanwhile in the Netherlands, a boy signs up for Erasmus." Kleine grap: "(No, the other one.)" met een pijltje naar de juiste tweeling.
- **Achtergrond:** koele polderlucht.

### 4. Barcelona: huisgenoten

- **Overgang:** beide lijnen komen tegelijk binnen en raken elkaar op één stip.
- **Beeld:** een Barcelonese gevel met smeedijzeren balkons. Inzoomen op een messing deurbelpaneel met twee naambordjes: zij en hij, piso 3º 2ª.
- **Tekst:** "Same city. Same flat. Same kitchen." Pauze. "Housemates." Pauze. "Just housemates." Klein, in mono: "(Seriously.)"
- **Achtergrond:** okergeel, Middellands licht.

### 5. Afscheid en appjes

- **Beeld:** het platte vliegtuig vertrekt diagonaal uit beeld richting Nederland. Daarna verschijnt een skeuomorfe telefoon midden in beeld.
- **Animatie:** chatbubbels poppen op terwijl je scrolt, met tijdstempels die steeds later worden: 22:41, 00:13, 02:58. De teller rechtsboven loopt op: `messages: 1… 214… 3,000+`.
- **Tekst:** "Then the semester ended and he flew home." "That's when the messages started."
- **Achtergrond:** zakt naar nachtblauw, ook in lichte modus. Dit is het enige donkere moment van het verhaal.

### 6. Het bezoek

- **Beeld:** het vliegtuig keert om en vliegt terug. Een boarding pass `AMS → BCN` schuift in beeld.
- **Tekst:** "He went back. Not for the city."
- **Moment:** de skyline van Barcelona bij zonsondergang (Bunkers del Carmel), twee silhouetten.
- **Achtergrond:** van nacht naar koraal.

### 7. Heen en weer

- **Beeld:** een stapel boarding passes die groeit, elk met een andere datum. De route-lijn zigzagt over de volle schermbreedte.
- **Animatie:** het vliegtuig pendelt mee met je scroll; de achtergrond wisselt tussen Barcelona-oker en Amsterdam-grijsblauw.
- **Tekst:** "For years, home was a departure gate." Met tellers: `flights: ??` en `km: ??`.

### 8. Eén enkele reis: Amsterdam 2025

- **Beeld:** het hoogtepunt van de film. Een groot plat vliegtuig trekt langzaam door de achtergrond van links naar rechts, met een witte condensstreep, terwijl tekst ervoor in beeld komt.
- **Object:** één boarding pass, groter dan de rest: `BCN → AMS · ONE WAY`. Daarna een koffer.
- **Tekst:** "In 2025 she bought a ticket without a return date."
- **Plek:** grachtenpanden, één raam brandt, twee figuren achter het glas.
- **Achtergrond:** grijsblauw met grachtgroen accent.

### 9. Terug naar Lima, met het hele gezin

- **Beeld:** de route trekt de lange lijn van AMS naar LIM, 10.500 km. Op het vliegtuigje verschijnen kleine stoeltjes: zij, hij, zijn ouders, de tweelingbroer.
- **Tekst:** "In 2026 they flew to Lima. Together. With his parents. And his twin brother."
- **Achtergrond:** de oceaan, dan het eerste ochtendlicht.

### 10. De Andes: het aanzoek

- **Beeld:** bergen rijzen laag voor laag op uit de onderkant van het scherm (platte parallax-lagen, van donker naar licht). Het vliegtuigraam keert terug als kader.
- **Ritme:** dit is de climax en moet het traagst zijn. Alle UI verdwijnt; alleen beeld en tekst.
- **Tekst:** "With the Andes as witnesses, he asked." Lange pauze. Dan, groot en cursief: "Sí."
- **Object:** een ringdoosje dat opengaat op je scroll. De twee gestippelde lijnen uit scène 1 knopen zich tot één lus rond de ring.
- **Achtergrond:** ijl blauw naar roze ochtendlicht, daarna bijna wit.

### 11. Girona: twee plekken worden één

- **Overgang:** de lus wordt weer een route en vliegt naar Catalonië. De kaart uit scène 1 komt terug, ingezoomd op het Empordà.
- **Beeld:** Mas Terrats als masia tussen olijfbomen, gouden middaglicht.
- **Tekst:** "Two places, 10,528 km apart, became one." Dan de uitnodiging: "Now we'd love you there." Groot: de datum.
- **Achtergrond:** goud en olijf.

### 12. Praktische informatie

Hier stopt de film en wordt het een rustige, leesbare pagina. Vormgegeven als een vluchtschema in mono: programma, reizen, overnachten, dresscode, cadeautips en vragen. Geen scroll-animaties meer, alleen zachte fades.

### 13. RSVP en aftiteling

- **RSVP:** een boarding pass die je invult: naam, aantal, dieetwensen. Versturen = de kaart wordt afgestempeld (`CONFIRMED`).
- **Aftiteling:** het vliegtuigraam van de splash, nu boven het Empordà bij zonsondergang. Het rolluik zakt langzaam. Daarna filmcredits: "Directed by love. Produced by WhatsApp. Special thanks to Erasmus." Met de tweelingbroer in de cast.

## Kleurverloop

Eén vaste achtergrondlaag achter de hele pagina, waarvan de kleur per scène meeschuift met je scroll.

| Scène | Achtergrond | Inkt | Gevoel |
| --- | --- | --- | --- |
| 0. Splash | #F5F1EC papier | #2A2622 | Rust, Mike |
| 1. Twee plekken | #EEF0F2 koel papier | #2A2622 | Afstand |
| 2. Lima | #F3DCC8 zand, accent #C8553D | #3A2620 | Warm, Pacific |
| 3. Nederland | #E4E9EE polderlucht | #23303A | Strak, nuchter |
| 4. Barcelona | #F6E3B4 oker | #3A2E1A | Zon, tegels |
| 5. Appjes | #1E2233 nacht | #F2EEE8 | Laat op de avond |
| 6. Bezoek | #F2B9A0 koraal | #3A221A | Verliefd |
| 7. Heen en weer | wissel #F6E3B4 en #DCE4EC | per kleur | Onrust, verlangen |
| 8. Amsterdam | #DCE4EC grijsblauw, accent #2F5D50 | #1F2A30 | Thuiskomen |
| 9. Naar Lima | #CBD6E2 oceaan | #1F2A30 | De lange reis |
| 10. Andes | #CBD6E2 → #F4C7B8 → #FFF7EE | #2A2622 | Stilte, climax |
| 11. Girona | #EBDDBF goud, accent #7A8450 olijf | #2E2A1C | Feest, belofte |
| 12–13. Info en RSVP | #F5F1EC papier | #2A2622 | Terug naar rust |

Laat de kleuren overvloeien in OKLCH, niet in RGB (oker naar grijsblauw wordt in RGB modderig).

**Dark mode:** dezelfde reeks als nachtversie (bijv. Lima #2B1F1C, Barcelona #2A2416, Girona #1F1D16), met gedimde illustraties en een paar echte nachtbeelden waar het telt.

## Tekst en tone of voice

Korte zinnen, veel lucht, een knipoog per scène. Een verteller in de derde persoon ("she", "he"); pas bij de uitnodiging spreekt het stel zelf ("we").

**Schrijfregels**

- Maximaal twee korte regels per beeld. Eén zin per scherm is beter.
- Pauzes zijn tekst: een lege scrollstap tussen "Housemates." en "Just housemates." maakt de grap.
- Concreet boven romantisch: "02:58" en "ONE WAY" zeggen meer dan "they couldn't stop talking".
- Gebruik echte details van het stel: het eerste appje, het aantal vluchten, het huisnummer in Barcelona.

**Hoe tekst in beeld komt**

| Techniek | Effect | Waar |
| --- | --- | --- |
| Regel-reveal | Elke regel schuift omhoog uit een masker, 80 ms na elkaar | Alle verhaalzinnen |
| Woord-fade met blur | Woorden komen scherp uit een waas | Emotionele zinnen (Andes, Girona) |
| Split-flap | Vertrekbord-letters: LIMA → BARCELONA → AMSTERDAM | Plaatsnamen in scène 1, 4, 8 en 11 |
| Typemachine in mono | Labels typen zich uit | Coördinaten, vluchtcodes, `ONE WAY` |
| Tellers | Getallen lopen op met je scroll | Kilometers, appjes, vluchten |
| Scrub | Tekst gekoppeld aan scrollpositie, ook terug | Alles in vastgepinde scènes |

**Voorbeeldscript (Engels, de standaardtaal)**

1. "This story begins in two places." / "10,528 km apart."
2. "Lima, Peru." / "She packs her life into two suitcases. Destination: Barcelona."
3. "Meanwhile in the Netherlands, a boy signs up for Erasmus." / "(No, the other one.)"
4. "Same city. Same flat. Same kitchen." / "Housemates." / "Just housemates." / "(Seriously.)"
5. "Then the semester ended and he flew home." / "That's when the messages started."
6. "He went back. Not for the city."
7. "For years, home was a departure gate."
8. "In 2025 she bought a ticket without a return date."
9. "In 2026 they flew to Lima. Together. With his parents. And his twin brother."
10. "With the Andes as witnesses, he asked." / "Sí."
11. "Two places, 10,528 km apart, became one." / "Now we'd love you there."

**Vertalen.** Spaans laten nalezen door haar familie. Latijns-Amerikaans Spaans ("ustedes", niet "vosotros"). Grappen per taal los schrijven: "Just housemates" werkt in het Nederlands beter als "Gewoon huisgenoten. Echt." Spaanse zinnen zijn 20 tot 25% langer; ontwerp op de Spaanse versie.

## Illustraties en ChatGPT-prompts

Maak eerst één stijlanker (het raam) en geef dat bij elke volgende prompt mee als referentie, in hetzelfde gesprek.

**Basisprompt (plak voor elke prompt):**

```
Soft photoreal product render, single isolated object, matte materials, muted pastel palette, soft studio light from the top left, short soft contact shadow, plain warm cream background #F5F1EC, minimal, calm, no text, no logos, no people's faces, centered, high detail. Match the style, lighting and camera of the reference image exactly.
```

| # | Asset | Scène | Prompt (na de basisprompt) | Let op |
| --- | --- | --- | --- | --- |
| 1 | Vliegtuigraam, rolluik open | 0, 10, 13 | Airplane cabin window seen straight on, rounded frame in warm off-white plastic, shade pulled up, glass area completely empty | Glas uitsnijden; uitzicht is een losse laag |
| 2 | Rolluik, los | 0 | Only the window shade panel, same material and angle as reference | Schuift via code over het glas |
| 3 | Uitzichten (dag, nacht, Empordà) | 0, 13 | View from an airplane window: sea of clouds at morning / starry night above clouds / golden hour over Catalan hills and olive fields | Rechthoekig, valt achter het glas |
| 4 | Wereldkaart-reliëf | 1, 11 | World map as a sculpted plaster relief tile, continents slightly raised, no borders, no labels | Pins en lijnen in SVG eroverheen |
| 5 | Lima | 2 | Small diorama: Miraflores cliffs above the Pacific, bougainvillea, seen through an open wooden colonial balcony window | Geen tekst in beeld |
| 6 | Nederland | 3 | Small diorama: flat Dutch polder, one bicycle, wide sky with soft clouds, two tiny identical figures | Tweeling-grap |
| 7 | Barcelona-gevel | 4 | Barcelona Eixample facade with wrought-iron balconies and green persiana shutters, two windows lit | |
| 8 | Deurbelpaneel | 4 | Brass apartment intercom panel with two blank name slots | Namen in code |
| 9 | Telefoon | 5 | Modern smartphone lying slightly tilted, screen completely blank | Chat in HTML |
| 10 | Koffer | 8 | Vintage hard-shell suitcase in soft sage, closed, upright | |
| 11 | Amsterdam | 8 | Narrow Amsterdam canal house facade at dusk, one window warmly lit | Ook voor dark mode |
| 12 | Ringdoosje open en dicht | 10 | Small velvet ring box in dusty rose, lid closed / lid open with a simple ring | Exact zelfde camera |
| 13 | Mas Terrats | 11, 13 | Old Catalan stone masia between olive trees, golden afternoon light, distant mountains | Echte foto's als referentie |

**Niet met ChatGPT:** vliegtuig, routes, pins en iconen (platte SVG); de Andes (vijf platte silhouetlagen in SVG voor parallax); boarding passes, vertrekbord en RSVP-kaart (HTML/CSS, want drie talen).

**Exporteren:** vrijgesteld als PNG, daarna WebP of AVIF, max. 2400 px breed, per beeld onder 300 KB.

## Interacties en details

- **Raam = dark mode.** Rolluik dicht = nacht, keuze bewaard. Echte nachtbeelden voor het uitzicht, Amsterdam en Mas Terrats; de rest dimt via een overlay.
- **Taalkeuze** rechtsboven in mono `EN · ES · NL`, teksten klapperen door als een vertrekbord. Standaard Engels.
- **Persoonlijke uitnodiging** via eigen link per gast (`?g=familia-rojas`): begroeting op de splash en naam vooringevuld op de RSVP, in hun taal.
- **Overslaan:** vaste knop `SKIP TO DETAILS ↓`. Tweede bezoek landt direct op de info, met `▶ Replay our story`.
- **Kleine verrassingen:** verkeerde tweeling aantikken ("Nope. The other one."), deurbel indrukken, bubbels verdwijnen bij terugscrollen, kilometerteller over de hele film.
- **Geluid** optioneel en standaard uit: cabinegezoem, golven, straatgeluid, wind.

## Techniek

| Onderdeel | Keuze | Waarvoor |
| --- | --- | --- |
| Basis | Astro, statisch | Snelle pagina, routes /en /es /nl |
| Smooth scroll | Lenis | Filmisch gevoel |
| Scroll-animatie | GSAP ScrollTrigger | Scènes vastpinnen, scrub |
| Routes en vliegtuig | GSAP DrawSVG en MotionPath | Lijn tekent zich, vliegtuig volgt pad |
| Tekst-reveals | GSAP SplitText | Regel- en woord-animaties |
| Achtergrondkleur | Eén CSS-variabele, OKLCH | Kleurverloop |
| Content | YAML + Pages CMS | Alle teksten en data bewerkbaar |
| RSVP | Tally, Formspree of Google Sheet | Zonder eigen backend |
| Hosting | Vercel of Netlify | Eigen domein |

- **Mobiel eerst** (WhatsApp-link op telefoon). Staand ontwerpen, kortere scrollafstanden, `svh`, geen horizontale scroll-hijacks.
- **Reduced motion:** dezelfde scènes als fades zonder pinning. Alle verhaaltekst als echte HTML-tekst.
- **Prestaties:** alleen de splash direct laden, rest lazy. Eerste download < 1,5 MB.
- **WhatsApp-preview:** OG-beeld met het raam, de namen en de datum.

## Kanttekeningen

- **Lengte** is het grootste risico: 12 scènes = 3 à 4 minuten scrollen. Scène 6 en 7 kunnen samen. Knip na de eerste test alles wat niet raakt.
- **Stijlconsistentie van AI-beelden** is het zwakste punt; reken op nabewerking. Twijfel = platte SVG.
- **Drie lagen discipline:** geen foto's, emoji of stockiconen erbij.
- **Privacy:** check met het stel wat gedeeld mag worden. `noindex`, privé repo.

## Volgende stappen

1. Low-fi storyboard in Figma, per scène één staand frame.
2. Stijlanker: het raam in ChatGPT, uitsnijden.
3. Prototype splash, scène 1 en de Amsterdam-vliegtuigscène.
4. Testen op een telefoon via een WhatsApp-link.
5. Overige scènes, vertalingen en RSVP.
