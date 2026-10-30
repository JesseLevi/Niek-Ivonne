// Routebeschrijving voor de flight plan-lijn (zie src/scripts/flight-plan.ts).
// Gedeeld tussen de componenten (die de route als data-attribuut schrijven) en het script.

export type RoutePoint =
  | [number, number]
  | {
      /** CSS-selector binnen de scène. */
      at: string;
      /** Plek binnen het element, 0–1 (standaard 0.5 = midden). */
      ax?: number;
      ay?: number;
      /** Verschuiving in px. */
      dx?: number;
      dy?: number;
    };

export interface RouteLine {
  points: RoutePoint[];
  start?: 'dot';
  end?: 'dot';
  /** Deel van de voortgang waarin deze lijn wordt getekend. */
  draw?: [number, number];
}

/**
 * Vaste x-posities (% schermbreedte) waar de lijn een scène in- en uitgaat.
 * Eén lijn loopt door het midden; de twee lijnen van Lima en Nederland lopen langs de randen
 * tot ze in Barcelona samenkomen.
 */
export const RAIL = {
  single: 50,
  lima: 9,
  netherlands: 91,
} as const;

/** Standaardroute voor één lijn: midden in, om de inhoud heen langs de zijkant, midden uit. */
export function aroundRoute(side: 'left' | 'right' = 'left', draw?: [number, number]): RouteLine[] {
  const x = side === 'left' ? 7 : 93;
  return [
    {
      points: [
        [RAIL.single, 0],
        [RAIL.single, 5],
        [x, 22],
        [x, 78],
        [RAIL.single, 95],
        [RAIL.single, 100],
      ],
      draw,
    },
  ];
}

/** Twee lijnen recht langs de randen (scène 2 en 3). */
export function railsRoute(draw?: [number, number]): RouteLine[] {
  return [
    { points: [[RAIL.lima, 0], [RAIL.lima, 100]], draw },
    { points: [[RAIL.netherlands, 0], [RAIL.netherlands, 100]], draw },
  ];
}
