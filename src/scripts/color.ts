// OKLCH-kleuren uitlezen uit de tokens en mengen. Mengen in OKLCH voorkomt
// de modderige tussenkleuren die je in RGB krijgt (bijv. oker → grijsblauw).

export interface Oklch {
  l: number; // 0–1
  c: number;
  h: number; // graden
}

/** Leest `oklch(96% 0.008 73.7)` of `oklch(0.96 0.008 73.7)`. */
export function parseOklch(value: string): Oklch | null {
  const match = value.trim().match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i);
  if (!match) return null;
  const [, l = '0', percent, c = '0', h = '0'] = match;
  return { l: percent ? Number(l) / 100 : Number(l), c: Number(c), h: Number(h) };
}

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`;
}

/**
 * Onder deze chroma is een kleur bijna grijs en zegt de tint weinig. Draaien over de
 * tintcirkel zou dan een vreemde omweg geven (zand → paars → polderlucht); meng zulke
 * paren daarom recht door OKLab, dat is dezelfde perceptuele ruimte zonder hoek.
 */
const LOW_CHROMA = 0.03;

export function mixOklch(a: Oklch, b: Oklch, t: number): Oklch {
  if (Math.min(a.c, b.c) < LOW_CHROMA) return mixOklab(a, b, t);
  let delta = b.h - a.h;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return {
    l: a.l + (b.l - a.l) * t,
    c: a.c + (b.c - a.c) * t,
    h: (a.h + delta * t + 360) % 360,
  };
}

function mixOklab(a: Oklch, b: Oklch, t: number): Oklch {
  const rad = Math.PI / 180;
  const A = a.c * Math.cos(a.h * rad) + (b.c * Math.cos(b.h * rad) - a.c * Math.cos(a.h * rad)) * t;
  const B = a.c * Math.sin(a.h * rad) + (b.c * Math.sin(b.h * rad) - a.c * Math.sin(a.h * rad)) * t;
  return {
    l: a.l + (b.l - a.l) * t,
    c: Math.hypot(A, B),
    h: (Math.atan2(B, A) / rad + 360) % 360,
  };
}
