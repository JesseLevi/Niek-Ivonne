// Zet alle vertaalde teksten uit src/content/ in één leesbaar document om te laten nalezen
// (docs/vertalingen.md): per bestand een tabel met Engels, Spaans en Nederlands naast elkaar.
//
// Gebruik: npm run export:translations

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const isTranslated = (v) => v && typeof v === 'object' && !Array.isArray(v) && ['en', 'es', 'nl'].every((k) => typeof v[k] === 'string');
const cell = (text) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');

function* walk(value, path) {
  if (isTranslated(value)) {
    yield [path, value];
    return;
  }
  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) yield* walk(item, `${path}[${item?.id ?? item?.slug ?? i + 1}]`);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) yield* walk(item, path ? `${path}.${key}` : key);
  }
}

let out = `# Vertalingen om na te lezen

Alle teksten van de site, per bestand. Spaans is Latijns-Amerikaans (\`ustedes\`, nooit \`vosotros\`).
Correcties kun je direct in Pages CMS doen (zie docs/cms.md), of hier aantekenen.
\`{distance}\` en dergelijke worden op de site vervangen door getallen; laat die staan.

_Gegenereerd met \`npm run export:translations\`; niet met de hand bewerken._
`;

for (const file of readdirSync('src/content').filter((f) => f.endsWith('.yml')).sort()) {
  const rows = [...walk(parse(readFileSync(`src/content/${file}`, 'utf8')), '')];
  if (!rows.length) continue;
  out += `\n## ${file}\n\n| Veld | English | Español | Nederlands |\n| --- | --- | --- | --- |\n`;
  for (const [path, t] of rows) out += `| \`${path}\` | ${cell(t.en)} | ${cell(t.es)} | ${cell(t.nl)} |\n`;
}

writeFileSync('docs/vertalingen.md', out);
console.log('docs/vertalingen.md');
