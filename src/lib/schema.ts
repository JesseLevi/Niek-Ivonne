// Zod-schema's voor alle contentbestanden in src/content/.
// Een fout in de YAML (bijv. via Pages CMS) laat de build falen met een leesbare melding.

import { z } from 'zod';
import { LOCALES, tokensIn } from './i18n';

const text = z.string().trim().min(1, 'mag niet leeg zijn');

/** Een vertaald veld: `{ en, es, nl }`, alle drie verplicht. */
export const translated = z.strictObject({ en: text, es: text, nl: text });

/** Leeg (`null`, `""` of een object met alleen lege waarden, zoals Pages CMS het kan opslaan). */
function isBlank(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value).every(isBlank);
  }
  return false;
}

/** Optioneel veld: lege waarden uit de CMS tellen als afwezig. */
function optional<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => (isBlank(value) ? undefined : value), schema.optional());
}

/** Controleert dat alleen de genoemde `{tokens}` voorkomen, in elke taal dezelfde. */
function checkTokens(allowed: readonly string[]) {
  return (value: Record<(typeof LOCALES)[number], string>, ctx: z.RefinementCtx) => {
    const reference = tokensIn(value.en).sort().join(',');
    for (const lang of LOCALES) {
      const tokens = tokensIn(value[lang]);
      for (const token of tokens) {
        if (!allowed.includes(token)) {
          ctx.addIssue({
            code: 'custom',
            path: [lang],
            message: `onbekend token {${token}}, toegestaan: ${allowed.map((a) => `{${a}}`).join(' ') || 'geen'}`,
          });
        }
      }
      if (tokens.sort().join(',') !== reference) {
        ctx.addIssue({
          code: 'custom',
          path: [lang],
          message: 'gebruikt andere {tokens} dan de Engelse tekst',
        });
      }
    }
  };
}

/** Aan/uit-veld, standaard uit. */
const flag = z.preprocess((value) => value ?? undefined, z.boolean().default(false));

const isoDate = z.iso.date('gebruik het formaat JJJJ-MM-DD');
const optionalUrl = z.union([z.literal(''), z.url('ongeldige URL')]);
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'alleen kleine letters, cijfers en streepjes');
const locale = z.enum(LOCALES);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'gebruik het formaat UU:MM');

/** Getallen uit stats.yml die in teksten als `{token}` gebruikt mogen worden. */
export const STAT_TOKENS = ['distance', 'messages', 'flights', 'flown_km'] as const;

// site.yml

export const siteSchema = z.strictObject({
  couple: z.strictObject({ first: text, second: text }),
  wedding: z.strictObject({
    date: isoDate,
    venue: text,
    town: text,
    region: text,
    province: text,
    country: translated,
    coordinates: z.strictObject({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  rsvp: z.strictObject({
    deadline: isoDate,
    form_url: optionalUrl,
  }),
  og: z.strictObject({ title: translated, description: translated }),
});

// stats.yml

const stat = z.strictObject({
  value: z.number().int().nonnegative(),
  plus: flag,
  label: translated,
});

export const statsSchema = z.strictObject({
  distance: stat,
  messages: stat.extend({ steps: z.array(z.number().int().nonnegative()).min(1) }),
  flights: stat,
  flown_km: stat,
});

// story.yml

const line = z
  .strictObject({
    style: z.enum(['serif', 'body', 'mono']),
    pause: flag,
    ...translated.shape,
  })
  .superRefine(checkTokens(STAT_TOKENS));

const chatMessage = z.strictObject({
  time,
  from: z.enum(['her', 'him']),
  ...translated.shape,
});

const scene = z.strictObject({
  id: slug,
  label: text,
  image: optional(z.string()),
  lines: z.array(line).min(1),
  surprise: optional(translated),
  chat: optional(z.array(chatMessage)),
});

export const storySchema = z.strictObject({
  scenes: z.array(scene).min(1),
  credits: z.array(z.strictObject({ role: translated, name: translated })),
});

// info.yml

const section = z.strictObject({ code: text, heading: translated });

export const infoSchema = z.strictObject({
  schedule: section.extend({
    items: z.array(z.strictObject({ time, title: translated, description: translated })),
  }),
  travel: section.extend({
    items: z.array(z.strictObject({ code: text, title: translated, body: translated })),
  }),
  stay: section.extend({
    items: z.array(z.strictObject({ name: text, url: optionalUrl, body: translated })),
  }),
  dresscode: section.extend({ body: translated }),
  gifts: section.extend({ body: translated }),
  faq: section.extend({
    items: z.array(z.strictObject({ question: translated, answer: translated })),
  }),
});

// ui.yml

export const uiSchema = z.strictObject({
  languages: translated,
  language_switcher: translated,
  choose_language: translated,
  scroll_to_board: translated,
  skip_to_details: translated,
  replay_story: translated,
  shade_close: translated,
  shade_open: translated,
  rsvp: z.strictObject({
    heading: translated,
    intro: translated.superRefine(checkTokens(['deadline'])),
    name: translated,
    party_size: translated,
    attending: translated,
    attending_yes: translated,
    attending_no: translated,
    diet: translated,
    submit: translated,
    confirmed: translated,
    error: translated,
    offline: translated,
  }),
});

// guests.yml

export const guestsSchema = z.strictObject({
  guests: z.array(
    z.strictObject({
      slug,
      name: text,
      language: locale,
      party_size: z.number().int().min(1).max(20),
      greeting: translated,
    }),
  ),
});

// images.yml

export const imagesSchema = z.strictObject({
  images: z.array(
    z.strictObject({
      id: slug,
      src: z.string().regex(/^\/images\/[^/]+\.(svg|png|webp|avif|jpe?g)$/, 'moet in /images/ staan'),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: translated,
    }),
  ),
});

export type Site = z.infer<typeof siteSchema>;
export type Stats = z.infer<typeof statsSchema>;
export type Story = z.infer<typeof storySchema>;
export type Scene = Story['scenes'][number];
export type StoryLine = Scene['lines'][number];
export type Info = z.infer<typeof infoSchema>;
export type Ui = z.infer<typeof uiSchema>;
export type Guest = z.infer<typeof guestsSchema>['guests'][number];
export type Image = z.infer<typeof imagesSchema>['images'][number];
