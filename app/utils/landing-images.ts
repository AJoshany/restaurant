/**
 * The restaurant photographs used across the public landing page, in both
 * encoded formats and both widths. Kept in one place so no component repeats
 * asset paths and `<LandingImage>` can be fed with a single `v-bind`.
 *
 * Source files are local (no CDN/stock-host dependency): `public/images/*.avif`
 * and `.webp`, generated at 900px/1600px widths.
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

export const LANDING_IMAGES = {
  diningRoom: responsiveImage('hero-dining-room', 1600, 1067),
  heritageRoom: responsiveImage('heritage-room', 1600, 1200),
  mainHall: responsiveImage('dining-hall', 1600, 1130),
  privateTable: responsiveImage('private-table', 1600, 1067),
  kitchen: responsiveImage('kitchen', 1600, 1067),
  plated: responsiveImage('plated', 1600, 1067)
} as const
