// Laadt en valideert alle contentbestanden tijdens de build.
// Gebruik alleen in Astro-frontmatter (server), niet in browsercode.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import { formatNumber, type Locale } from './i18n';
import {
  guestsSchema,
  imagesSchema,
  infoSchema,
  siteSchema,
  statsSchema,
  storySchema,
  uiSchema,
  type Image,
  type Stats,
} from './schema';

import siteRaw from '../content/site.yml?raw';
import storyRaw from '../content/story.yml?raw';
import statsRaw from '../content/stats.yml?raw';
import infoRaw from '../content/info.yml?raw';
import uiRaw from '../content/ui.yml?raw';
import guestsRaw from '../content/guests.yml?raw';
import imagesRaw from '../content/images.yml?raw';

export class ContentError extends Error {
  override name = 'ContentError';
}

function load<T extends z.ZodType>(file: string, raw: string, schema: T): z.output<T> {
  let data: unknown;
  try {
    data = parse(raw, { prettyErrors: true });
  } catch (error) {
    throw new ContentError(`src/content/${file} is geen geldige YAML:\n${String(error)}`);
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new ContentError(`src/content/${file} klopt niet:\n${issues}`);
  }
  return result.data;
}

function assertUnique(file: string, label: string, values: string[]): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new ContentError(`src/content/${file}: ${label} "${value}" komt dubbel voor`);
    seen.add(value);
  }
}

export const site = load('site.yml', siteRaw, siteSchema);
export const story = load('story.yml', storyRaw, storySchema);
export const stats = load('stats.yml', statsRaw, statsSchema);
export const info = load('info.yml', infoRaw, infoSchema);
export const ui = load('ui.yml', uiRaw, uiSchema);
export const guests = load('guests.yml', guestsRaw, guestsSchema).guests;
export const images = load('images.yml', imagesRaw, imagesSchema).images;

// Controles over bestanden heen.
assertUnique('story.yml', 'scène-id', story.scenes.map((s) => s.id));
assertUnique('guests.yml', 'slug', guests.map((g) => g.slug));
assertUnique('images.yml', 'id', images.map((i) => i.id));

for (const image of images) {
  if (!existsSync(join(process.cwd(), 'public', image.src))) {
    throw new ContentError(`src/content/images.yml: beeld "${image.id}" verwijst naar ${image.src}, maar dat bestand bestaat niet in public/`);
  }
}

const imagesById = new Map(images.map((image) => [image.id, image]));
for (const scene of story.scenes) {
  if (scene.image && !imagesById.has(scene.image)) {
    throw new ContentError(
      `src/content/story.yml: scène "${scene.id}" verwijst naar onbekend beeld "${scene.image}" (zie images.yml)`,
    );
  }
}

export function getImage(id: string): Image {
  const image = imagesById.get(id);
  if (!image) throw new ContentError(`Onbekend beeld "${id}" (zie src/content/images.yml)`);
  return image;
}

/** Getallen voor `{tokens}` in teksten, opgemaakt per taal (bijv. 10,528 of 10.528). */
export function statTokens(lang: Locale): Record<keyof Stats, string> {
  const format = (key: keyof Stats) =>
    formatNumber(stats[key].value, lang) + (stats[key].plus ? '+' : '');
  return {
    distance: format('distance'),
    messages: format('messages'),
    flights: format('flights'),
    flown_km: format('flown_km'),
  };
}
