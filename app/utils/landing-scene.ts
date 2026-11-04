import { gsap } from 'gsap'
import type { FloatTarget } from '~/utils/landing-float'
import type { LandingIngredient, LandingSceneProfile } from '~/utils/landing-scene-config'

/**
 * The landing's single scroll-driven story: a loaded fork glides to centre
 * stage and lets go of its pasta nest; the nest opens into a loose swirl
 * that spins in mid-air while tomatoes and basil fly in around it; then a
 * plate slides in and everything falls into it, becoming the finished dish.
 *
 * Every stage is a small builder adding tweens to one scrubbed master
 * timeline, so scrolling back up rewinds the exact same motion. DOM lookup
 * and lifecycle stay in `LandingExperience.vue`; this module only knows the
 * choreography, and `landing-scene-config.ts` holds its numbers.
 */

const SELECTORS = {
  redPanel: '[data-red-panel]',
  heroCopy: '[data-hero-copy]',
  scrollCue: '[data-scroll-cue]',
  storyCopy: '[data-story-copy]',
  closingCopy: '[data-closing-copy]',
  finalAction: '[data-final-action]',
  forkStage: '[data-fork-stage]',
  fullFork: '[data-full-fork]',
  fork: '[data-fork-only]',
  nest: '[data-pasta-only]',
  swirlStage: '[data-swirl-stage]',
  swirlFloat: '[data-swirl-float]',
  swirl: '[data-swirl]',
  plateStage: '[data-plate-stage]',
  emptyPlate: '[data-empty-plate]',
  filledPlate: '[data-filled-plate]'
} as const

interface SceneIngredient {
  config: LandingIngredient
  /** Positioned by CSS and never transformed, so its rect is a stable origin. */
  slot: HTMLElement
  /** Driven by the scrubbed timeline. */
  body: HTMLElement
  /** Driven by the idle float ticker. */
  bob: HTMLElement
}

export type LandingSceneElements = Record<keyof typeof SELECTORS, HTMLElement> & {
  ingredients: SceneIngredient[]
}

interface Point {
  x: number
  y: number
}

// Physical coordinates inside the artwork (the images are never mirrored).
const NEST_CENTER: Point = { x: 0.36, y: 0.44 }
const SWIRL_CENTER: Point = { x: 0.5, y: 0.5 }
const PLATE_CENTER: Point = { x: 0.5, y: 0.45 }
// Share of each artwork's box the food actually fills, used to size the
// swirl so it lies inside the plate's food bed.
const SWIRL_FOOD = { width: 0.7, height: 0.94 }
const PLATE_FOOD = { width: 0.7, height: 0.6 }
// The swirl turns a quarter so its long axis lies along the plate.
const SWIRL_LANDING_ROTATION = 90

// The swirl first appears as a nest-sized disc, then unfolds outward.
const SWIRL_CLOSED = 'circle(20% at 50% 50%)'
const SWIRL_OPEN = 'circle(75% at 50% 50%)'

// How far ingredients drift upward while airborne (fraction of viewport
// height): nearer ones move more, which is what sells the depth.
const INGREDIENT_DRIFT = { front: 0.07, back: 0.03 } as const
const INGREDIENT_LANDED_SCALE = { front: 0.62, back: 0.72 } as const
const INGREDIENT_FLOAT_WEIGHT = { front: 1.35, back: 0.7 } as const

export function findLandingSceneElements(root: HTMLElement): LandingSceneElements | null {
  const found: Partial<Record<keyof typeof SELECTORS, HTMLElement>> = {}
  for (const [key, selector] of Object.entries(SELECTORS)) {
    const element = root.querySelector<HTMLElement>(selector)
    if (!element) return null
    found[key as keyof typeof SELECTORS] = element
  }

  // Ingredients hidden by the current breakpoint (`display: none`) have no
  // boxes; leaving them out keeps the compact timeline lighter.
  const ingredients: SceneIngredient[] = []
  root.querySelectorAll<HTMLElement>('[data-ingredient-slot]').forEach((slot) => {
    const config = LANDING_INGREDIENTS[Number(slot.dataset.ingredientSlot)]
    const body = slot.querySelector<HTMLElement>('[data-ingredient]')
    const bob = slot.querySelector<HTMLElement>('[data-ingredient-bob]')
    if (config && body && bob && slot.getClientRects().length > 0) {
      ingredients.push({ config, slot, body, bob })
    }
  })

  return { ...(found as Record<keyof typeof SELECTORS, HTMLElement>), ingredients }
}

function pointIn(element: HTMLElement, at: Point): Point {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width * at.x, y: rect.top + rect.height * at.y }
}

function offsetBetween(from: Point, to: Point): Point {
  return { x: to.x - from.x, y: to.y - from.y }
}

interface SceneContext {
  tl: gsap.core.Timeline
  el: LandingSceneElements
  profile: LandingSceneProfile
  /** +1 in LTR, -1 in RTL: converts inline-axis values to physical x. */
  inline: 1 | -1
  float: { value: number }
}

/**
 * Builds the scrubbed timeline. Call inside a `gsap.matchMedia()` handler so
 * the timeline and its ScrollTrigger are reverted with it; the returned
 * function stops the idle float ticker, which matchMedia can't revert.
 */
export function createLandingScene(
  section: HTMLElement,
  el: LandingSceneElements,
  { isRtl, profile }: { isRtl: boolean; profile: LandingSceneProfile }
): () => void {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: profile.scrub,
      invalidateOnRefresh: true
    }
  })
  const ctx: SceneContext = { tl, el, profile, inline: isRtl ? -1 : 1, float: { value: 0 } }

  setInitialState(ctx)
  addLowering(ctx)
  addSeparation(ctx)
  addUnwrap(ctx)
  addFloat(ctx)
  addIngredients(ctx)
  addPlating(ctx)
  // Hold the finished composition for the last stretch of scroll.
  tl.to({}, { duration: LANDING_SCENE_STAGE.end - tl.duration() })

  const floatTargets: FloatTarget[] = [
    { element: el.swirlFloat, phase: 0, weight: 1 },
    ...el.ingredients.map(({ bob, config }, index) => ({
      element: bob,
      phase: (index + 1) * 1.1,
      weight: INGREDIENT_FLOAT_WEIGHT[config.depth]
    }))
  ]
  return startLandingFloat(floatTargets, ctx.float, {
    amplitudePx: profile.floatAmplitudePx,
    tiltDeg: profile.floatTiltDeg
  })
}

function setInitialState({ el, profile }: SceneContext) {
  gsap.set(
    [
      el.storyCopy,
      el.closingCopy,
      el.finalAction,
      el.fork,
      el.nest,
      el.swirl,
      el.emptyPlate,
      el.filledPlate,
      ...el.ingredients.map(({ body }) => body)
    ],
    { autoAlpha: 0 }
  )
  gsap.set([el.fullFork, el.fork, el.nest], {
    transformOrigin: `${NEST_CENTER.x * 100}% ${NEST_CENTER.y * 100}%`
  })
  if (profile.clipReveal) gsap.set(el.swirl, { clipPath: SWIRL_CLOSED })
  gsap.set(el.emptyPlate, { yPercent: 70, scale: 0.86 })
}

/** Stage 1 — the loaded fork glides into the middle of the screen. */
function addLowering({ tl, el }: SceneContext) {
  // The stages are never transformed, so their rects give stable paths.
  // Function-based values are re-read on every ScrollTrigger refresh.
  const nestToCentre = () =>
    offsetBetween(pointIn(el.forkStage, NEST_CENTER), pointIn(el.swirlStage, SWIRL_CENTER))

  tl.to(
    [el.fullFork, el.fork, el.nest],
    {
      x: () => nestToCentre().x,
      y: () => nestToCentre().y,
      scale: 0.8,
      rotation: -4,
      duration: LANDING_SCENE_STAGE.separate,
      ease: 'power1.inOut'
    },
    LANDING_SCENE_STAGE.lower
  )
  tl.to(el.scrollCue, { autoAlpha: 0, duration: 0.15 }, LANDING_SCENE_STAGE.lower)
  tl.to(el.heroCopy, { y: -38, autoAlpha: 0, duration: 0.3 }, LANDING_SCENE_STAGE.lower + 0.3)
  tl.to(el.redPanel, { autoAlpha: 0, duration: 0.4 }, LANDING_SCENE_STAGE.lower + 0.45)
}

/**
 * Stage 2 — the photograph hands over to its two pixel-aligned cut-outs; the
 * fork withdraws outward while the nest slips off its tines.
 */
function addSeparation({ tl, el, inline }: SceneContext) {
  tl.to(el.fullFork, { autoAlpha: 0, duration: 0.08 }, LANDING_SCENE_STAGE.separate)
  tl.to([el.fork, el.nest], { autoAlpha: 1, duration: 0.08 }, LANDING_SCENE_STAGE.separate)
  tl.to(
    el.fork,
    {
      // The fork starts in the inline-end column, so "outward" is that edge.
      xPercent: inline * 30,
      yPercent: -45,
      rotation: -16,
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power1.in'
    },
    LANDING_SCENE_STAGE.separate + 0.05
  )
  tl.to(
    el.nest,
    {
      yPercent: 4,
      rotation: -14,
      duration: LANDING_SCENE_STAGE.unwrap - LANDING_SCENE_STAGE.separate,
      ease: 'sine.inOut'
    },
    LANDING_SCENE_STAGE.separate + 0.05
  )
}

/**
 * Stage 3 — the nest opens up: it keeps turning and dissolves while the
 * loose swirl unfolds outward from the same point, still spinning.
 */
function addUnwrap({ tl, el, profile, float }: SceneContext) {
  const unwrap = LANDING_SCENE_STAGE.float - LANDING_SCENE_STAGE.unwrap
  tl.to(
    el.nest,
    { rotation: 40, scale: 0.7, autoAlpha: 0, duration: unwrap * 0.6, ease: 'sine.in' },
    LANDING_SCENE_STAGE.unwrap
  )
  tl.fromTo(
    el.swirl,
    {
      autoAlpha: 0,
      rotation: -70,
      scale: profile.clipReveal ? 0.85 : 0.6,
      ...(profile.clipReveal && { clipPath: SWIRL_CLOSED })
    },
    {
      autoAlpha: 1,
      rotation: 0,
      scale: 1,
      ...(profile.clipReveal && { clipPath: SWIRL_OPEN }),
      duration: unwrap,
      ease: 'power2.out',
      immediateRender: false
    },
    LANDING_SCENE_STAGE.unwrap
  )
  tl.to(float, { value: 1, duration: 0.5 }, LANDING_SCENE_STAGE.unwrap + 0.2)
  tl.fromTo(
    el.storyCopy,
    { y: 40, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.4, immediateRender: false },
    LANDING_SCENE_STAGE.unwrap
  )
}

/** Stage 4 — the open swirl hangs in mid-air, turning along a slow arc. */
function addFloat({ tl, el }: SceneContext) {
  const half = (LANDING_SCENE_STAGE.land - LANDING_SCENE_STAGE.float) / 2
  tl.to(
    el.swirl,
    { rotation: 14, yPercent: -1, duration: half, ease: 'sine.inOut' },
    LANDING_SCENE_STAGE.float
  )
  tl.to(
    el.swirl,
    { rotation: 8, yPercent: 2, scale: 0.97, duration: half, ease: 'sine.inOut' },
    LANDING_SCENE_STAGE.float + half
  )
}

/**
 * Ingredients fly in from every side while the swirl unwraps, hang around
 * it at different depths, then fall into the plate a beat after one another.
 */
function addIngredients({ tl, el, profile, inline }: SceneContext) {
  el.ingredients.forEach(({ config, slot, body }, index) => {
    const { depth, enterFrom, spin, landing } = config
    const enterAt = LANDING_SCENE_STAGE.unwrap - 0.1 + index * 0.06
    const landAt = LANDING_SCENE_STAGE.land + 0.05 + index * 0.04

    tl.fromTo(
      body,
      {
        x: () => enterFrom.x * inline * window.innerWidth * profile.ingredientTravel,
        y: () => enterFrom.y * window.innerHeight * profile.ingredientTravel,
        rotation: -spin * 0.5,
        scale: 0.6,
        autoAlpha: 0
      },
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'power2.out',
        immediateRender: false
      },
      enterAt
    )

    tl.to(
      body,
      {
        y: () => -window.innerHeight * INGREDIENT_DRIFT[depth],
        rotation: spin * 0.2,
        duration: landAt - (enterAt + 0.7),
        ease: 'sine.inOut'
      },
      enterAt + 0.7
    )

    // Into the dish: aim at a spot on the food bed, accelerating like a drop.
    const toPlate = () => {
      const target = pointIn(el.plateStage, {
        x: PLATE_CENTER.x + landing.x * inline,
        y: PLATE_CENTER.y + landing.y
      })
      return offsetBetween(pointIn(slot, { x: 0.5, y: 0.5 }), target)
    }
    tl.to(
      body,
      {
        x: () => toPlate().x,
        y: () => toPlate().y,
        rotation: spin * 0.5,
        scale: INGREDIENT_LANDED_SCALE[depth],
        duration: LANDING_SCENE_STAGE.impact - landAt,
        ease: 'power2.in'
      },
      landAt
    )
    // The plated photograph already holds tomato and basil; hand over to it.
    tl.to(body, { autoAlpha: 0, duration: 0.18 }, LANDING_SCENE_STAGE.impact)
  })
}

/**
 * Stage 5 — the plate slides in beneath, the swirl lies down into it turning
 * a quarter, and on impact the finished dish takes its place.
 */
function addPlating({ tl, el, float }: SceneContext) {
  const swirlToPlate = () => {
    const offset = offsetBetween(
      pointIn(el.swirlStage, SWIRL_CENTER),
      pointIn(el.plateStage, PLATE_CENTER)
    )
    const swirl = el.swirlStage.getBoundingClientRect()
    const plate = el.plateStage.getBoundingClientRect()
    // After the quarter turn the swirl's length runs across the plate and
    // its width runs into the plate's depth.
    return {
      ...offset,
      scaleY: (plate.width * PLATE_FOOD.width) / (swirl.height * SWIRL_FOOD.height),
      scaleX: (plate.height * PLATE_FOOD.height) / (swirl.width * SWIRL_FOOD.width)
    }
  }

  tl.to(el.storyCopy, { y: -28, autoAlpha: 0, duration: 0.25 }, LANDING_SCENE_STAGE.land - 0.15)
  tl.to(
    el.emptyPlate,
    { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
    LANDING_SCENE_STAGE.land - 0.05
  )
  tl.to(
    el.swirl,
    {
      x: () => swirlToPlate().x,
      y: () => swirlToPlate().y,
      yPercent: 0,
      rotation: SWIRL_LANDING_ROTATION,
      scaleX: () => swirlToPlate().scaleX,
      scaleY: () => swirlToPlate().scaleY,
      duration: LANDING_SCENE_STAGE.impact - LANDING_SCENE_STAGE.land,
      ease: 'power2.in'
    },
    LANDING_SCENE_STAGE.land
  )
  tl.to(float, { value: 0, duration: 0.5 }, LANDING_SCENE_STAGE.land + 0.1)

  // Impact — the swirl settles flat and the plated dish takes its place.
  tl.to(
    el.swirl,
    { scaleX: () => swirlToPlate().scaleX * 0.6, autoAlpha: 0, duration: 0.2 },
    LANDING_SCENE_STAGE.impact
  )
  tl.to(el.emptyPlate, { autoAlpha: 0, duration: 0.2 }, LANDING_SCENE_STAGE.impact)
  tl.fromTo(
    el.filledPlate,
    { autoAlpha: 0, scale: 0.94, y: 10 },
    { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(2)', immediateRender: false },
    LANDING_SCENE_STAGE.impact
  )
  tl.fromTo(
    el.closingCopy,
    { y: 34, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.35, immediateRender: false },
    LANDING_SCENE_STAGE.impact + 0.15
  )
  tl.fromTo(
    el.finalAction,
    { y: 20, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.25, immediateRender: false },
    LANDING_SCENE_STAGE.impact + 0.45
  )
}
