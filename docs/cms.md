# Teksten aanpassen met Pages CMS

Alle teksten van de site staan in `src/content/` en zijn te bewerken via [Pages CMS](https://pagescms.org), zonder YAML te zien. De configuratie staat in `.pages.yml` in de root.

## Inloggen

1. Ga naar [app.pagescms.org](https://app.pagescms.org) en log in met GitHub.
2. Kies de repo `JesseLevi/Niek-Ivonne` en de branch `main`.
3. Links staan de onderdelen: **Site**, **Verhaal**, **Tellers**, **Praktische info**, **Knoppen en labels**, **Gasten** en **Illustraties**.

Wie niet in de repo mag schrijven, kan door de eigenaar worden uitgenodigd als collaborator in Pages CMS (alleen e-mail nodig, geen GitHub-account).

## Een zin aanpassen

Voorbeeld: de Spaanse versie van de eerste zin.

1. Open **Verhaal** en klap scène **1. two-places** open.
2. Onder **Regels** staat elke zin in English, Español en Nederlands onder elkaar.
3. Pas het veld **Español** aan en klik op **Save**.

Pages CMS maakt daarmee een commit op `main`. Vercel/Netlify bouwt de site opnieuw; na een minuut of twee staat de wijziging live.

## Goed om te weten

- **Getallen in zinnen** schrijf je als `{distance}`, `{messages}`, `{flights}` of `{flown_km}`. De site vult het getal uit **Tellers** in, met de juiste punt of komma per taal. Gebruik in alle drie de talen dezelfde tokens.
- **Alleen-lezen velden** (zoals de ID van een scène) zijn gekoppeld aan de code en kun je niet wijzigen.
- **Fouten blokkeren de site niet.** Mist er een vertaling of staat er een tikfout in een token, dan faalt de build en blijft de vorige versie online. De melding in Vercel/Netlify noemt het bestand en het veld.
- **`# TODO`-opmerkingen** in de YAML markeren mock data. Pages CMS kan die opmerkingen weghalen als je een bestand opslaat; dat is niet erg zolang de tekst zelf echt is.
- **Illustraties vervangen:** open **Illustraties**, kies het beeld en upload het nieuwe bestand (WebP, onder 300 KB). Houd dezelfde breedte × hoogte, of pas die velden mee aan.
- **Gasten:** de repo is publiek. Zet bij gasten alleen een naam en begroeting, nooit adressen of telefoonnummers.

## Voor developers

`npm run check:cms` controleert of `.pages.yml` en de bestanden in `src/content/` op elkaar aansluiten. Staat er een veld in de YAML dat niet in `.pages.yml` staat, dan zou Pages CMS het bij opslaan kunnen weggooien; het script meldt dat. Draai het na elke wijziging aan het contentmodel (het zit ook in `npm run check`).
