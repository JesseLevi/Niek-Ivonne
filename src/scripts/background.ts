// Eén vaste achtergrondlaag voor de hele pagina. De kleur (en inkt en accent) schuift
// met de scroll mee van scène naar scène, gemengd in OKLCH. De kleuren komen uit
// src/styles/tokens.css: --scene-<id>-bg/-ink/-accent plus eventuele stops -2-, -3-, ...

import { formatOklch, mixOklch, parseOklch, type Oklch } from './color';

interface Stop {
  bg: Oklch;
  ink: Oklch;
  accent: Oklch;
}

export interface BackgroundScene {
  palette: string;
  /** 0 → 1 terwijl de scène het scherm in schuift. */
  enter: () => number;
  /** 0 → 1 tijdens het afspelen van de scène (voor extra kleurstops). */
  play: () => number;
}

const FALLBACK: Oklch = { l: 0.96, c: 0.008, h: 73.7 };

function readStops(palette: string, styles: CSSStyleDeclaration): Stop[] {
  const read = (name: string) => parseOklch(styles.getPropertyValue(name));
  const base = {
    bg: read(`--scene-${palette}-bg`) ?? FALLBACK,
    ink: read(`--scene-${palette}-ink`) ?? read('--ink') ?? FALLBACK,
    accent: read(`--scene-${palette}-accent`) ?? read('--accent') ?? FALLBACK,
  };
  const stops: Stop[] = [base];
  for (let i = 2; ; i++) {
    const bg = read(`--scene-${palette}-${i}-bg`);
    if (!bg) break;
    stops.push({
      bg,
      ink: read(`--scene-${palette}-${i}-ink`) ?? base.ink,
      accent: read(`--scene-${palette}-${i}-accent`) ?? base.accent,
    });
  }
  return stops;
}

function mixStops(a: Stop, b: Stop, t: number): Stop {
  return { bg: mixOklch(a.bg, b.bg, t), ink: mixOklch(a.ink, b.ink, t), accent: mixOklch(a.accent, b.accent, t) };
}

/** Kleur binnen een scène met meerdere stops, gelijk verdeeld over het afspelen. */
function along(stops: Stop[], progress: number): Stop {
  const first = stops[0] as Stop;
  if (stops.length === 1) return first;
  const scaled = Math.min(Math.max(progress, 0), 1) * (stops.length - 1);
  const index = Math.min(Math.floor(scaled), stops.length - 2);
  return mixStops(stops[index] as Stop, stops[index + 1] as Stop, scaled - index);
}

export class Background {
  private scenes: BackgroundScene[] = [];
  private stops = new Map<string, Stop[]>();
  private last = '';

  constructor(private root: HTMLElement = document.documentElement) {
    // Het thema (rolluik) wisselt de tokens: opnieuw uitlezen.
    new MutationObserver(() => this.refreshPalettes()).observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  setScenes(scenes: BackgroundScene[]): void {
    this.scenes = scenes;
    this.refreshPalettes();
  }

  refreshPalettes(): void {
    const styles = getComputedStyle(this.root);
    this.stops.clear();
    for (const { palette } of this.scenes) {
      if (!this.stops.has(palette)) this.stops.set(palette, readStops(palette, styles));
    }
    this.last = '';
    this.update();
  }

  /** Bepaalt de kleur uit de huidige scrollpositie; deterministisch, dus ook goed bij terugscrollen. */
  update(): void {
    if (!this.scenes.length) return;
    const stopsOf = (scene: BackgroundScene) => this.stops.get(scene.palette) ?? [];

    // De laatste scène die al (deels) in beeld is geschoven bepaalt de kleur.
    let index = 0;
    for (let i = 1; i < this.scenes.length; i++) {
      if ((this.scenes[i] as BackgroundScene).enter() > 0) index = i;
    }
    const scene = this.scenes[index] as BackgroundScene;
    const stops = stopsOf(scene);
    if (!stops.length) return;

    let color: Stop;
    const enter = index === 0 ? 1 : scene.enter();
    if (enter < 1) {
      const previous = stopsOf(this.scenes[index - 1] as BackgroundScene);
      const from = previous[previous.length - 1] ?? (stops[0] as Stop);
      color = mixStops(from, stops[0] as Stop, enter);
    } else {
      color = along(stops, scene.play());
    }
    this.apply(color);
  }

  private apply({ bg, ink, accent }: Stop): void {
    const key = `${formatOklch(bg)}|${formatOklch(ink)}|${formatOklch(accent)}`;
    if (key === this.last) return;
    this.last = key;
    const style = this.root.style;
    style.setProperty('--color-bg', formatOklch(bg));
    style.setProperty('--color-ink', formatOklch(ink));
    style.setProperty('--color-accent', formatOklch(accent));
  }
}
