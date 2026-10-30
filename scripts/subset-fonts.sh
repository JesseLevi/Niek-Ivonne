#!/usr/bin/env bash
# Maakt de self-hosted WOFF2-fonts in public/fonts/: gesubset op Latin plus de
# Spaanse tekens (á é í ó ú ñ ü ¿ ¡ º ª) en de pijlen/symbolen uit de luchtvaartlabels.
#
# Vereist: pip install fonttools brotli
# Gebruik: scripts/subset-fonts.sh [werkmap]   (bronbestanden komen van github.com/google/fonts)
set -euo pipefail

WORK="${1:-$(mktemp -d)}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/fonts"
SRC="https://raw.githubusercontent.com/google/fonts/main/ofl"
mkdir -p "$WORK" "$OUT"

fetch() { [ -f "$WORK/$2" ] || curl -sSfL -o "$WORK/$2" "$SRC/$1"; }
fetch instrumentserif/InstrumentSerif-Regular.ttf InstrumentSerif-Regular.ttf
fetch instrumentserif/InstrumentSerif-Italic.ttf InstrumentSerif-Italic.ttf
fetch "inter/Inter%5Bopsz,wght%5D.ttf" Inter-Variable.ttf
fetch ibmplexmono/IBMPlexMono-Regular.ttf IBMPlexMono-Regular.ttf
fetch ibmplexmono/IBMPlexMono-Medium.ttf IBMPlexMono-Medium.ttf

# Basic Latin, Latin-1 (incl. á é í ó ú ñ ü ¿ ¡ º ª · °), Œ œ, typografische
# aanhalingstekens en streepjes, €, ™, pijlen (→ ↓ ↔), ▶ en ✓.
UNICODES="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2009,U+200A,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+20AC,U+2122,U+2190-2195,U+21C4,U+2212,U+25B6,U+2713"
FEATURES="kern,liga,calt,ss01,tnum,case"

subset() {
  pyftsubset "$1" --output-file="$OUT/$2" --flavor=woff2 --unicodes="$UNICODES" \
    --layout-features="$FEATURES" --no-hinting --desubroutinize --name-IDs='*' --name-languages='*'
}

# Inter: alleen gewicht 400–600 en een vaste optische grootte (tekst), dat scheelt veel bytes.
fonttools varLib.instancer "$WORK/Inter-Variable.ttf" wght=400:600 opsz=14 -o "$WORK/Inter-Text.ttf" -q

subset "$WORK/InstrumentSerif-Regular.ttf" instrument-serif-regular.woff2
subset "$WORK/InstrumentSerif-Italic.ttf" instrument-serif-italic.woff2
subset "$WORK/Inter-Text.ttf" inter-variable.woff2
subset "$WORK/IBMPlexMono-Regular.ttf" ibm-plex-mono-regular.woff2
subset "$WORK/IBMPlexMono-Medium.ttf" ibm-plex-mono-medium.woff2

ls -l "$OUT"/*.woff2
