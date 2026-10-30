// Maakt SVG-placeholders voor elk beeld in src/content/images.yml waarvan `src` op .svg eindigt:
// crème vlak in de juiste verhouding met de assetnaam erin. Vervang ze later 1-op-1 door de
// echte illustratie (pas dan `src` aan in images.yml of via Pages CMS › Illustraties).
//
// Gebruik: npm run placeholders

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

// Placeholders zijn tijdelijke beelden, geen code: kleuren uit het concept (papier, inkt, accent).
const PAPER = '#F5F1EC';
const INK = '#2A2622';
const ACCENT = '#3B4FD8';

const { images } = parse(readFileSync('src/content/images.yml', 'utf8'));
mkdirSync('public/images', { recursive: true });

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

for (const image of images) {
  if (!image.src.endsWith('.svg')) continue;
  const { width: w, height: h } = image;
  const unit = Math.min(w, h);
  const inset = Math.round(unit * 0.04);
  const name = image.src.split('/').pop();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>${escape(name)} (placeholder)</title>
  <rect width="${w}" height="${h}" fill="${PAPER}"/>
  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" rx="${inset}" fill="none" stroke="${INK}" stroke-opacity="0.25" stroke-width="${Math.max(2, unit * 0.004)}" stroke-dasharray="${unit * 0.02} ${unit * 0.015}"/>
  <path d="M${inset} ${inset}L${w - inset} ${h - inset}M${w - inset} ${inset}L${inset} ${h - inset}" stroke="${INK}" stroke-opacity="0.08" stroke-width="${Math.max(1, unit * 0.002)}"/>
  <g font-family="ui-monospace, Menlo, monospace" text-anchor="middle" fill="${INK}">
    <text x="${w / 2}" y="${h / 2}" font-size="${Math.round(unit * 0.06)}" letter-spacing="1">${escape(name)}</text>
    <text x="${w / 2}" y="${h / 2 + unit * 0.08}" font-size="${Math.round(unit * 0.035)}" fill-opacity="0.55">${w} × ${h}</text>
  </g>
  <circle cx="${w / 2}" cy="${h / 2 - unit * 0.12}" r="${unit * 0.02}" fill="${ACCENT}"/>
</svg>
`;
  writeFileSync(join('public', image.src), svg);
  console.log(`${image.src}  ${w}×${h}`);
}
