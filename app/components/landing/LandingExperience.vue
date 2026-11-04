<script setup lang="ts">
import { gsap } from 'gsap'

/**
 * The scroll-driven landing: one tall scroll track with a sticky, full-screen
 * stage. Owns the DOM and the GSAP lifecycle only — the choreography is
 * `landing-scene.ts`, its numbers `landing-scene-config.ts`.
 *
 * Rendered for every viewport when motion is allowed (`pages/index.vue`
 * swaps in the static sections for reduced motion). `gsap.matchMedia()`
 * picks the desktop or compact profile and rebuilds on breakpoint changes;
 * a locale switch rebuilds too, because RTL flips the inline axis.
 */
const { t, localeProperties } = useI18n()
const root = ref<HTMLElement | null>(null)
const images = LANDING_SCENE_IMAGES

const MOTION = '(prefers-reduced-motion: no-preference)'
const conditions = {
  desktop: `(min-width: 1024px) and ${MOTION}`,
  compact: `(max-width: 1023px) and ${MOTION}`
}

// Each anchor spans its chapter of the scroll track, so the pagination's
// centre-line observer always finds exactly one of them.
const { home, story, visit } = LANDING_SCENE_ANCHORS
const anchors = [
  { id: 'home', from: home, to: story },
  { id: 'story', from: story, to: visit },
  { id: 'visit', from: visit, to: 1 }
].map(({ id, from, to }) => ({
  id,
  style: {
    top: `calc(var(--scene-scroll) * ${from})`,
    height: `calc(var(--scene-scroll) * ${to - from}${to === 1 ? ' + 100svh' : ''})`
  }
}))

let media: ReturnType<typeof gsap.matchMedia> | null = null

function buildScene() {
  media?.revert()
  media = gsap.matchMedia()
  media.add(conditions, (context) => {
    const { desktop, compact } = (context.conditions ?? {}) as Record<
      keyof typeof conditions,
      boolean
    >
    const section = root.value
    const elements = section && findLandingSceneElements(section)
    if (!section || !elements || (!desktop && !compact)) return

    return createLandingScene(section, elements, {
      isRtl: localeProperties.value.dir === 'rtl',
      profile: desktop ? LANDING_SCENE_PROFILES.desktop : LANDING_SCENE_PROFILES.compact
    })
  })
}

onMounted(buildScene)

// The `dir` attribute and the translated copy land a frame after the locale
// changes; rebuild once layout reflects them so every path is re-measured.
watch(
  () => localeProperties.value.dir,
  async () => {
    await nextTick()
    requestAnimationFrame(() => requestAnimationFrame(buildScene))
  }
)

onBeforeUnmount(() => {
  media?.revert()
  media = null
})
</script>

<template>
  <div
    ref="root"
    class="relative h-[calc(var(--scene-scroll)+100svh)] bg-cream-50 [--ingredient-scale:1.6] [--scene-scroll:300svh] md:[--ingredient-scale:1.25] md:[--scene-scroll:340svh] lg:[--ingredient-scale:1] lg:[--scene-scroll:440svh]"
  >
    <span
      v-for="anchor in anchors"
      :id="anchor.id"
      :key="anchor.id"
      class="pointer-events-none absolute start-0 w-px"
      :style="anchor.style"
      aria-hidden="true"
    />

    <div class="sticky top-0 h-[100svh] overflow-hidden bg-cream-50">
      <LandingHeroArt>
        <img
          data-fork-only
          v-bind="images.fork"
          alt=""
          decoding="async"
          draggable="false"
          class="invisible absolute inset-0 h-full w-full object-contain opacity-0 will-change-transform"
        />
        <img
          data-pasta-only
          v-bind="images.pastaNest"
          alt=""
          decoding="async"
          draggable="false"
          class="invisible absolute inset-0 h-full w-full object-contain opacity-0 will-change-transform"
        />
      </LandingHeroArt>

      <section
        data-hero-copy
        class="absolute inset-0 z-10 mx-auto flex max-w-screen-xl flex-col justify-start px-5 pt-[6.25rem] sm:px-8 sm:pt-[7.5rem] lg:justify-center lg:pt-20"
      >
        <LandingHeroCopy />
      </section>

      <p
        data-scroll-cue
        class="absolute bottom-7 start-8 z-10 hidden items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-800/70 lg:flex rtl:tracking-normal"
        aria-hidden="true"
      >
        <span class="block h-px w-10 bg-ink-800/50" />
        {{ t('landing.hero.scroll') }}
      </p>

      <!-- The pasta owns the centre of the screen from here on, so the copy
           frames it: headline above, details along the bottom edge. -->
      <section
        data-story-copy
        class="invisible absolute inset-0 z-10 mx-auto flex max-w-screen-xl flex-col justify-between px-5 pb-[5svh] pt-[5.75rem] opacity-0 sm:px-8 lg:pb-[6svh] lg:pt-[12svh]"
      >
        <div class="text-center">
          <p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-tomato-700">
            {{ t('landing.story.section') }}
          </p>
          <h2
            class="mx-auto mt-3 font-editorial text-[clamp(1.9rem,8.4vw,4rem)] leading-none tracking-[-0.05em] text-ink-900 lg:mt-4 lg:text-[clamp(2.75rem,4.4vw,4.75rem)] rtl:font-sans rtl:leading-[1.2] rtl:tracking-normal"
          >
            {{ t('landing.story.titleLine1') }} {{ t('landing.story.titleLine2') }}
          </h2>
        </div>
        <div
          class="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-start"
        >
          <p
            class="max-w-[34ch] font-editorial text-base italic leading-snug text-ink-800 sm:max-w-[min(20rem,32%)] lg:max-w-[min(20rem,26%)] lg:text-lg rtl:font-sans rtl:not-italic"
          >
            {{ t('landing.story.descriptionFirst') }}
            <span class="max-sm:hidden">{{ t('landing.story.descriptionSecond') }}</span>
          </p>
          <LandingAction :label="t('landing.cta.explore')" />
        </div>
      </section>

      <section
        data-closing-copy
        class="invisible absolute inset-0 z-10 mx-auto flex max-w-screen-xl flex-col items-center px-5 pt-[5.75rem] text-center opacity-0 sm:px-8 lg:pt-[11svh]"
      >
        <p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-tomato-700">
          {{ t('landing.closing.section') }}
        </p>
        <h2
          class="mt-3 font-editorial text-[clamp(2.1rem,9.2vw,4rem)] leading-none tracking-[-0.05em] text-ink-900 lg:mt-4 lg:text-[clamp(2.75rem,4.4vw,4.75rem)] rtl:font-sans rtl:leading-[1.2] rtl:tracking-normal"
        >
          {{ t('landing.closing.title') }}
        </h2>
        <p
          class="mt-4 max-w-[36ch] font-editorial text-base italic leading-snug text-ink-800 sm:text-lg lg:max-w-none lg:text-xl rtl:font-sans rtl:not-italic"
        >
          {{ t('landing.closing.description') }}
        </p>
        <div data-final-action class="invisible mt-5 opacity-0 lg:mt-6">
          <LandingAction :label="t('landing.cta.order')" />
        </div>
      </section>

      <div
        data-plate-stage
        class="pointer-events-none absolute inset-x-0 bottom-[7%] z-20 mx-auto aspect-[1752/897] w-[min(94vw,96svh)] lg:bottom-[3%] lg:w-[min(70%,108svh)]"
      >
        <img
          data-empty-plate
          v-bind="images.plateEmpty"
          alt=""
          fetchpriority="low"
          decoding="async"
          draggable="false"
          class="invisible absolute inset-0 h-full w-full object-contain opacity-0 will-change-transform"
        />
        <img
          data-filled-plate
          v-bind="images.platePasta"
          :alt="t('landing.closing.imageAlt')"
          fetchpriority="low"
          decoding="async"
          draggable="false"
          class="invisible absolute inset-0 h-full w-full object-contain opacity-0 will-change-transform"
        />
      </div>

      <div
        data-swirl-stage
        class="pointer-events-none absolute inset-x-0 top-[25svh] z-20 mx-auto h-[49svh] w-[32.7svh] lg:top-[23svh] lg:h-[72svh] lg:w-[48svh]"
      >
        <div data-swirl-float class="absolute inset-0 will-change-transform">
          <img
            data-swirl
            v-bind="images.pastaSwirl"
            :alt="t('landing.story.imageAlt')"
            fetchpriority="low"
            decoding="async"
            draggable="false"
            class="invisible absolute inset-0 h-full w-full object-contain opacity-0 will-change-transform"
          />
        </div>
      </div>

      <LandingIngredients />
    </div>
  </div>
</template>
