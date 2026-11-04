/**
 * The restaurant photographs used across the public landing page, in both
 * encoded formats and both widths. Kept in one place so no component repeats
 * asset paths and `<LandingImage>` can be fed with a single `v-bind`.
 *
 * Source files are local (no CDN/stock-host dependency): `public/images/*.avif`
 * and `.webp`, generated at 900px/1600px widths. The pasta scene's
 * transparent cut-outs live in `public/images/landing/` as WebP with alpha;
 * their full-resolution PNG masters are kept in `design/landing-source/`.
 */
export interface ResponsiveImage {
  avifSmall: string
  avifLarge: string
  webpSmall: string
  webpLarge: string
  width: number
  height: number
}

function responsiveImage(name: string, width: number, height: number): ResponsiveImage {
  return {
    avifSmall: `/images/${name}-900.avif`,
    avifLarge: `/images/${name}-1600.avif`,
    webpSmall: `/images/${name}-900.webp`,
    webpLarge: `/images/${name}-1600.webp`,
    width,
    height
  }
}

/** A single transparent cut-out (WebP with alpha) and its intrinsic size. */
export interface CutoutImage {
  src: string
  width: number
  height: number
}

function cutout(name: string, width: number, height: number): CutoutImage {
  return { src: `/images/landing/${name}.webp`, width, height }
}

/**
 * Transparent artwork for the scroll-driven pasta scene. The loaded fork and
 * its two cut-outs (`fork`, `pastaNest`) share one canvas, so they stack
 * pixel-aligned and the hand-over between them is invisible.
 */
export const LANDING_SCENE_IMAGES = {
  forkLoaded: cutout('fork-loaded', 1022, 1539),
  fork: cutout('fork', 1022, 1538),
  pastaNest: cutout('pasta-nest', 1022, 1538),
  pastaSwirl: cutout('pasta-swirl', 1024, 1536),
  plateEmpty: cutout('plate-empty', 1753, 897),
  platePasta: cutout('plate-pasta', 1752, 897)
} as const

/** Ingredients cut from the swirl render, so lighting and grading match it. */
export const LANDING_INGREDIENT_IMAGES = {
  tomatoRound: cutout('tomato-1', 152, 138),
  tomatoSmall: cutout('tomato-2', 124, 106),
  basilBroad: cutout('basil-1', 101, 63),
  basilLong: cutout('basil-2', 108, 82),
  basilCurled: cutout('basil-3', 80, 70)
} as const

export type LandingIngredientImage = keyof typeof LANDING_INGREDIENT_IMAGES

export const LANDING_IMAGES = {
  diningRoom: responsiveImage('hero-dining-room', 1600, 1067),
  heritageRoom: responsiveImage('heritage-room', 1600, 1200),
  mainHall: responsiveImage('dining-hall', 1600, 1130),
  privateTable: responsiveImage('private-table', 1600, 1067),
  kitchen: responsiveImage('kitchen', 1600, 1067),
  plated: responsiveImage('plated', 1600, 1067)
} as const
