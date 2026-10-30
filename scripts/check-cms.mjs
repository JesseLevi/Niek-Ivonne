// Controleert of .pages.yml en de bestanden in src/content/ op elkaar aansluiten.
// Een veld dat wel in de YAML staat maar niet in .pages.yml kan verloren gaan
// zodra iemand het bestand via Pages CMS opslaat; dat wil je vóór die tijd weten.
//
// Gebruik: npm run check:cms

import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

const config = parse(readFileSync('.pages.yml', 'utf8'));
const components = config.components ?? {};
const errors = [];

function resolve(field) {
  if (!field.component) return field;
  const base = components[field.component];
  if (!base) {
    errors.push(`.pages.yml: onbekend component "${field.component}" bij veld "${field.name}"`);
    return { ...field, type: 'object', fields: [] };
  }
  const { component: _component, ...overrides } = field;
  return resolve({ ...base, ...overrides });
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isBlank = (value) =>
  value === undefined || value === null || value === '' || (isObject(value) && Object.values(value).every(isBlank));

function checkSingle(field, value, path) {
  switch (field.type) {
    case 'object':
      if (!isObject(value)) return errors.push(`${path}: verwacht een object`);
      return checkFields(field.fields ?? [], value, path);
    case 'string':
    case 'text':
    case 'image':
    case 'date':
      if (typeof value !== 'string') errors.push(`${path}: verwacht tekst, kreeg ${JSON.stringify(value)}`);
      else if (field.pattern) {
        const regex = typeof field.pattern === 'string' ? field.pattern : field.pattern.regex;
        if (!new RegExp(regex).test(value)) errors.push(`${path}: "${value}" past niet bij ${regex}`);
      }
      return;
    case 'number':
      if (typeof value !== 'number') errors.push(`${path}: verwacht een getal`);
      return;
    case 'boolean':
      if (typeof value !== 'boolean') errors.push(`${path}: verwacht true/false`);
      return;
    case 'select': {
      const names = (field.options?.values ?? []).map((v) => (isObject(v) ? v.name : v));
      if (!names.includes(value)) errors.push(`${path}: "${value}" is geen keuze uit ${names.join(', ')}`);
      return;
    }
    default:
      errors.push(`${path}: veldtype "${field.type}" wordt door dit script niet gecontroleerd`);
  }
}

function checkField(rawField, value, path) {
  const field = resolve(rawField);
  if (isBlank(value)) {
    if (field.required) errors.push(`${path}: verplicht veld ontbreekt`);
    return;
  }
  if (field.list) {
    if (!Array.isArray(value)) return errors.push(`${path}: verwacht een lijst`);
    value.forEach((item, i) => checkSingle(field, item, `${path}[${i}]`));
  } else {
    checkSingle(field, value, path);
  }
}

function checkFields(fields, data, path) {
  const names = new Set(fields.map((f) => f.name));
  for (const key of Object.keys(data)) {
    if (!names.has(key)) errors.push(`${path}.${key}: staat in de YAML maar niet in .pages.yml`);
  }
  for (const field of fields) checkField(field, data[field.name], `${path}.${field.name}`);
}

function walk(entries) {
  for (const entry of entries) {
    if (entry.type === 'group') walk(entry.items ?? []);
    if (entry.type !== 'file') continue;
    if (!existsSync(entry.path)) {
      errors.push(`.pages.yml: ${entry.path} bestaat niet`);
      continue;
    }
    const data = parse(readFileSync(entry.path, 'utf8'));
    checkFields(entry.fields ?? [], data ?? {}, entry.path);
  }
}

walk(config.content ?? []);

const mediaInput = typeof config.media === 'string' ? config.media : config.media?.input;
if (mediaInput && !existsSync(mediaInput)) errors.push(`.pages.yml: media-map ${mediaInput} bestaat niet`);

if (errors.length) {
  console.error(`Pages CMS-config sluit niet aan op de content:\n${errors.map((e) => `  • ${e}`).join('\n')}`);
  process.exit(1);
}
console.log('Pages CMS-config sluit aan op src/content/.');
