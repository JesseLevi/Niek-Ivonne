// Herbruikbare tekstanimaties (docs/concept.md › Hoe tekst in beeld komt).
//
// Elke helper geeft een GSAP-tijdlijn terug in "natuurlijke" seconden. Los af te spelen
// (`.play()`), of in een scène-tijdlijn te hangen en te schalen met `place()`:
//
//   place(ctx.timeline, lineReveal(el), 0.1, 0.2)
//
// Alles werkt met scrub (ook terug scrollen): de stand hangt alleen van de voortgang af.
// Met reduced motion wordt elke helper een rustige fade, of staat de eindstand meteen.

import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { formatNumber, type Locale } from '../lib/i18n';

gsap.registerPlugin(SplitText);

export interface TextOptions {
  /** Standaard: `prefers-reduced-motion`. */
  reducedMotion?: boolean;
}

function prefersReducedMotion(options: TextOptions): boolean {
  return options.reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Toegankelijke tekst naast een geanimeerde weergave: de animatie is aria-hidden, een
 * visueel verborgen kopie met de eindtekst wordt voorgelezen. (aria-label mag niet op <p>/<span>.)
 */
function accessibleCopy(el: HTMLElement, text: string): HTMLElement {
  const copy = document.createElement('span');
  copy.className = 'visually-hidden';
  copy.textContent = text;
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  visual.className = 'text-visual';
  el.replaceChildren(copy, visual);
  return visual;
}

/** Een rustige fade, de vervanger van elke helper bij reduced motion. */
function calmFade(targets: gsap.TweenTarget, duration = 0.6): gsap.core.Timeline {
  return gsap.timeline().fromTo(targets, { autoAlpha: 0 }, { autoAlpha: 1, duration, ease: 'none' });
}

/** Hangt `child` in `parent` op positie `at`, geschaald naar lengte `length` (in parent-eenheden). */
export function place(
  parent: gsap.core.Timeline,
  child: gsap.core.Timeline,
  at: number,
  length?: number,
): gsap.core.Timeline {
  if (length !== undefined && child.duration() > 0) child.timeScale(child.duration() / length);
  parent.add(child, at);
  return child;
}

/**
 * Een tijdlijn die bij elke update `render(voortgang)` aanroept. Basis voor helpers
 * die geen CSS-eigenschap tweenen (split-flap, typemachine, teller).
 */
function progressTimeline(duration: number, render: (progress: number) => void): gsap.core.Timeline {
  const state = { progress: 0 };
  render(0);
  return gsap.timeline().to(state, {
    progress: 1,
    duration,
    ease: 'none',
    onUpdate: () => render(state.progress),
  });
}

// Regel-reveal ---------------------------------------------------------------

export interface LineRevealOptions extends TextOptions {
  /** Tijd tussen twee regels in seconden (concept: 80 ms). */
  stagger?: number;
  duration?: number;
}

/** Elke regel schuift omhoog uit een masker, 80 ms na elkaar. Herberekent regels bij resize en fonts. */
export function lineReveal(el: HTMLElement, options: LineRevealOptions = {}): gsap.core.Timeline {
  const { stagger = 0.08, duration = 0.8 } = options;
  if (prefersReducedMotion(options)) return calmFade(el, duration);

  const wrapper = gsap.timeline();
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    // Regels bevatten de woorden in volgorde; schermlezers lezen ze gewoon voor.
    aria: 'none',
    autoSplit: true,
    onSplit(self) {
      // Bij opnieuw splitsen (andere breedte, font geladen) dezelfde stand terugzetten.
      const progress = wrapper.progress();
      wrapper.clear();
      wrapper.from(self.lines, { yPercent: 110, duration, stagger, ease: 'power3.out' });
      wrapper.progress(progress);
    },
  });
  return wrapper;
}

// Woord-fade met blur ---------------------------------------------------------

export interface WordBlurOptions extends TextOptions {
  stagger?: number;
  duration?: number;
  /** Maximale vervaging in px. */
  blur?: number;
}

/** Woorden komen scherp uit een waas. Voor de emotionele zinnen (Andes, Girona). */
export function wordBlur(el: HTMLElement, options: WordBlurOptions = {}): gsap.core.Timeline {
  const { stagger = 0.12, duration = 1, blur = 12 } = options;
  if (prefersReducedMotion(options)) return calmFade(el, duration);

  const split = SplitText.create(el, { type: 'words', wordsClass: 'split-word', aria: 'none' });
  return gsap.timeline().fromTo(
    split.words,
    { autoAlpha: 0, filter: `blur(${blur}px)` },
    { autoAlpha: 1, filter: 'blur(0px)', duration, stagger, ease: 'power2.out' },
  );
}

// Split-flap -----------------------------------------------------------------

export interface SplitFlapOptions extends TextOptions {
  /** Seconden per woordwissel. */
  duration?: number;
  /** Hoe vaak een letter omklapt voordat hij stilstaat. */
  flips?: number;
}

const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Vaste pseudo-willekeur, zodat dezelfde scrollstand altijd dezelfde letters geeft. */
function flapChar(cell: number, tick: number): string {
  const n = Math.abs(Math.sin(cell * 12.9898 + tick * 78.233) * 43758.5453);
  return FLAP_CHARS[Math.floor((n - Math.floor(n)) * FLAP_CHARS.length)] ?? 'A';
}

/**
 * Vertrekbord-letters: klappert van woord naar woord, bijv. LIMA → BARCELONA → AMSTERDAM.
 * Begint bij het eerste woord; het laatste woord is ook de toegankelijke tekst.
 */
export function splitFlap(el: HTMLElement, words: string[], options: SplitFlapOptions = {}): gsap.core.Timeline {
  const { duration = 1, flips = 6 } = options;
  const board = words.map((word) => [...word.toLocaleUpperCase()]);
  const width = Math.max(...board.map((chars) => chars.length));
  const last = board[board.length - 1] ?? [];

  el.classList.add('split-flap');
  const visual = accessibleCopy(el, last.join(''));
  visual.replaceChildren(
    ...Array.from({ length: width }, () => {
      const cell = document.createElement('span');
      cell.className = 'split-flap-cell';
      return cell;
    }),
  );
  const cells = [...visual.children] as HTMLElement[];
  const show = (chars: string[]) => cells.forEach((cell, i) => (cell.textContent = chars[i] ?? ' '));

  if (prefersReducedMotion(options) || board.length < 2) {
    show(last);
    return gsap.timeline();
  }

  const changes = board.length - 1;
  return progressTimeline(duration * changes, (progress) => {
    const position = progress * changes;
    const index = Math.min(Math.floor(position), changes - 1);
    const local = position - index; // 0 → 1 binnen deze wissel
    const from = board[index] ?? [];
    const to = board[index + 1] ?? [];
    cells.forEach((cell, i) => {
      // Letters komen van links naar rechts tot stilstand.
      const settle = 0.4 + (0.6 * i) / Math.max(width - 1, 1);
      let char: string;
      if (local <= 0) char = from[i] ?? ' ';
      else if (local >= settle) char = to[i] ?? ' ';
      else char = flapChar(i, index * 100 + Math.floor((local / settle) * flips));
      if (cell.textContent !== char) cell.textContent = char;
    });
  });
}

// Typemachine ----------------------------------------------------------------

export interface TypewriterOptions extends TextOptions {
  /** Seconden per teken. */
  speed?: number;
  /** Knipperende cursor achter de laatste letter. */
  caret?: boolean;
}

/** Labels typen zich uit in mono (coördinaten, vluchtcodes, ONE WAY). De breedte ligt vooraf vast. */
export function typewriter(el: HTMLElement, options: TypewriterOptions = {}): gsap.core.Timeline {
  const { speed = 0.05, caret = true } = options;
  const text = el.textContent ?? '';
  if (prefersReducedMotion(options)) return calmFade(el);

  const chars = [...text];
  el.classList.add('typewriter');
  const visual = accessibleCopy(el, text);
  visual.replaceChildren(
    ...chars.map((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      return span;
    }),
  );
  const spans = [...visual.children] as HTMLElement[];
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-caret';
  cursor.setAttribute('aria-hidden', 'true');

  return progressTimeline(chars.length * speed, (progress) => {
    const visible = Math.round(progress * chars.length);
    spans.forEach((span, i) => span.classList.toggle('is-hidden', i >= visible));
    if (!caret) return;
    if (progress <= 0 || progress >= 1) cursor.remove();
    else spans[Math.max(visible - 1, 0)]?.after(cursor);
  });
}

// Teller ---------------------------------------------------------------------

export interface CounterOptions extends TextOptions {
  to: number;
  from?: number;
  lang: Locale;
  /** Alleen deze waarden tonen, bijv. [1, 214, 3000] voor "1… 214… 3,000+". */
  steps?: number[];
  /** Plusteken achter de eindwaarde (3,000+). */
  plus?: boolean;
  duration?: number;
}

/** Getal dat met de scroll oploopt, opgemaakt per taal (10,528 / 10.528). */
export function counter(el: HTMLElement, options: CounterOptions): gsap.core.Timeline {
  const { to, from = 0, lang, steps, plus = false, duration = 1 } = options;
  const format = (value: number) => formatNumber(value, lang) + (plus && value >= to ? '+' : '');
  const final = format(to);

  el.classList.add('counter');
  el.setAttribute('aria-hidden', 'true');
  if (!el.nextElementSibling?.classList.contains('counter-label')) {
    const copy = document.createElement('span');
    copy.className = 'visually-hidden counter-label';
    copy.textContent = final;
    el.after(copy);
  }
  el.textContent = final;
  if (prefersReducedMotion(options)) return gsap.timeline();
  // Breedte van de eindwaarde vasthouden, zodat de zin eromheen niet verschuift.
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;

  return progressTimeline(duration, (progress) => {
    let value: number;
    if (steps?.length) {
      value = steps[Math.min(Math.floor(progress * steps.length), steps.length - 1)] ?? to;
      if (progress <= 0) value = from;
    } else {
      value = Math.round(from + (to - from) * gsap.parseEase('power1.out')(progress));
    }
    el.textContent = format(value);
  });
}
