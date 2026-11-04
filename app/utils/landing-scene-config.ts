import type { LandingIngredientImage } from '~/utils/landing-images'

/**
 * Choreography constants for the landing's scroll-driven pasta scene. The
 * timeline itself lives in `landing-scene.ts`; everything tunable lives here
 * so timing and placement never get repeated as magic numbers.
 */

/**
 * Where each stage starts on the master timeline. The timeline is stretched
 * over the section's whole scroll distance, so only the proportions matter.
 *
 * lower    → the loaded fork glides to centre stage, the hero copy leaves
 * separate → the fork lets go and withdraws; the nest hangs free
 * unwrap   → the nest opens into a loose swirl; ingredients fly in
 * float    → everything hangs in mid-air, turning on a slow arc
 * land     → the plate arrives; swirl and ingredients fall into it
 * impact   → the finished dish takes over; closing copy and CTA
 * end      → hold the final composition
 */
export const LANDING_SCENE_STAGE = {
  lower: 0,
  separate: 0.9,
  unwrap: 1.35,
  float: 2.0,
  land: 2.9,
  impact: 3.7,
  end: 4.6
} as const

/**
 * Timeline progress (0–1) each in-page anchor lands on, so `#story` and
 * `#visit` scroll to the moment that copy is fully on screen.
 */
export const LANDING_SCENE_ANCHORS = {
  home: 0,
  story: (LANDING_SCENE_STAGE.unwrap + 0.5) / LANDING_SCENE_STAGE.end,
  visit: (LANDING_SCENE_STAGE.impact + 0.75) / LANDING_SCENE_STAGE.end
} as const

/**
 * Per-layout motion settings. `compact` covers phones and tablets: shorter
 * travel, gentler idle float, and no clip-path reveal (a per-frame repaint
 * that low-end GPUs feel). Scroll length itself is CSS (`--scene-scroll`).
 */
export const LANDING_SCENE_PROFILES = {
  desktop: {
    scrub: 0.5,
    floatAmplitudePx: 12,
    floatTiltDeg: 2,
    ingredientTravel: 0.6,
    clipReveal: true
  },
  compact: {
    scrub: 0.35,
    floatAmplitudePx: 7,
    floatTiltDeg: 1.5,
    ingredientTravel: 0.45,
    clipReveal: false
  }
} as const

export type LandingSceneProfile =
  (typeof LANDING_SCENE_PROFILES)[keyof typeof LANDING_SCENE_PROFILES]

/** Idle bob period while food is airborne. */
export const LANDING_FLOAT_PERIOD_S = 3.2

interface Placement {
  /** Centre, in % of the stage width from the inline-start edge. */
  x: number
  /** Centre, in % of the stage height from the top. */
  y: number
}

export interface LandingIngredient {
  image: LandingIngredientImage
  /** Width in `vmin`, multiplied by the layout's `--ingredient-scale`. */
  size: number
  /** `back` passes behind the pasta and drifts less; `front` passes over it. */
  depth: 'back' | 'front'
  desktop: Placement
  /** Omitted → the ingredient is desktop-only. */
  compact?: Placement
  /** Direction it flies in from (unit-ish vector, inline-start = -x). */
  enterFrom: { x: number; y: number }
  /** Total rotation over its flight, in degrees. */
  spin: number
  /** Where it settles on the plate, offset from the food's centre (fractions of the plate). */
  landing: { x: number; y: number }
  mirrored?: boolean
}

export const LANDING_INGREDIENTS: readonly LandingIngredient[] = [
  {
    image: 'tomatoRound',
    size: 8.5,
    depth: 'back',
    desktop: { x: 22, y: 33 },
    compact: { x: 11, y: 31 },
    enterFrom: { x: -1, y: -0.35 },
    spin: 150,
    landing: { x: -0.17, y: -0.02 }
  },
  {
    image: 'basilBroad',
    size: 7.5,
    depth: 'front',
    desktop: { x: 28, y: 58 },
    compact: { x: 10, y: 57 },
    enterFrom: { x: -1, y: 0.45 },
    spin: -120,
    landing: { x: -0.08, y: -0.12 }
  },
  {
    image: 'tomatoSmall',
    size: 6.5,
    depth: 'front',
    desktop: { x: 73, y: 37 },
    compact: { x: 89, y: 40 },
    enterFrom: { x: 1, y: -0.55 },
    spin: -140,
    landing: { x: 0.15, y: -0.06 }
  },
  {
    image: 'basilLong',
    size: 8,
    depth: 'back',
    desktop: { x: 79, y: 62 },
    compact: { x: 88, y: 66 },
    enterFrom: { x: 1, y: 0.35 },
    spin: 150,
    landing: { x: 0.06, y: -0.14 }
  },
  {
    image: 'basilCurled',
    size: 6,
    depth: 'front',
    desktop: { x: 86, y: 25 },
    compact: { x: 84, y: 25 },
    enterFrom: { x: 0.8, y: -1 },
    spin: 130,
    landing: { x: 0.2, y: 0.04 },
    mirrored: true
  },
  {
    image: 'tomatoRound',
    size: 6,
    depth: 'back',
    desktop: { x: 66, y: 75 },
    enterFrom: { x: 0.4, y: 1 },
    spin: 110,
    landing: { x: 0.1, y: 0.08 },
    mirrored: true
  },
  {
    image: 'basilCurled',
    size: 5.5,
    depth: 'back',
    desktop: { x: 34, y: 27 },
    enterFrom: { x: -0.3, y: -1 },
    spin: 90,
    landing: { x: -0.12, y: 0.06 }
  },
  {
    image: 'tomatoSmall',
    size: 10,
    depth: 'front',
    desktop: { x: 15, y: 67 },
    enterFrom: { x: -1, y: 0.8 },
    spin: -100,
    landing: { x: -0.2, y: 0.09 },
    mirrored: true
  }
]
