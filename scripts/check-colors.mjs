// Kleuren alleen via tokens: geen hex-, rgb()- of hsl()-kleuren buiten src/styles/tokens.css.
//
// Gebruik: npm run check:colors

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const ALLOWED = join('src', 'styles', 'tokens.css');
const EXTENSIONS = /\.(css|astro|ts|js|mjs|svg|html)$/;
const COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?)\(/gi;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (EXTENSIONS.test(name)) yield path;
  }
}

const hits = [];
for (const file of files(ROOT)) {
  if (file === ALLOWED) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const match of line.matchAll(COLOR)) hits.push(`${file}:${i + 1}  ${match[0]}`);
    });
}

if (hits.length) {
  console.error(`Kleuren buiten ${ALLOWED} (gebruik een token):\n${hits.map((h) => `  • ${h}`).join('\n')}`);
  process.exit(1);
}
console.log(`Geen losse kleuren buiten ${ALLOWED}.`);
