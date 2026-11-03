<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)

const slides = [
  { key: 'room', image: LANDING_IMAGES.diningRoom, priority: false },
  { key: 'kitchen', image: LANDING_IMAGES.kitchen, priority: false },
  { key: 'plate', image: LANDING_IMAGES.plated, priority: false },
  { key: 'corner', image: LANDING_IMAGES.privateTable, priority: false }
] as const

let media: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  media = gsap.matchMedia()

  /**
   * The panel is pinned by CSS (`sticky`) rather than by ScrollTrigger, so the
   * section's own height defines the scroll distance. The timeline below is
   * scrubbed against that distance: every transition is a pure function of the
   * current scroll position, which is why scrolling up rewinds it exactly.
   */
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const element = root.value
    if (!element) {
      return
    }

    const slideElements = Array.from(element.querySelectorAll<HTMLElement>('[data-slide]'))
    const progress = element.querySelector('[data-progress]')
    if (slideElements.length === 0) {
      return
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    })

    slideElements.forEach((slide, index) => {
      const caption = slide.querySelector('[data-slide-caption]')
      const image = slide.querySelector('[data-slide-image]')

      if (index > 0) {
        const previous = slideElements[index - 1]
        const previousCaption = previous?.querySelector('[data-slide-caption]')

        if (previous) {
          timeline.to(previous, { autoAlpha: 0, duration: 0.45 }, index - 0.45)
        }
        if (previousCaption) {
          timeline.to(previousCaption, { yPercent: -22, autoAlpha: 0, duration: 0.3 }, index - 0.5)
        }

        timeline.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, index - 0.45)

        if (caption) {
          timeline.fromTo(
            caption,
            { yPercent: 32, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.5 },
            index - 0.25
          )
        }
      }

      // Each photograph keeps drifting inward for as long as it is on screen,
      // so the image never sits still under a scrolling pointer.
      if (image) {
        timeline.fromTo(
          image,
          { scale: 1.12 },
          { scale: 1, duration: 1.35 },
          Math.max(0, index - 0.35)
        )
      }
    })

    if (progress) {
      timeline.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: slideElements.length }, 0)
    }
  })
})

onBeforeUnmount(() => {
  media?.revert()
  media = null
})
</script>

<template>
  <section id="rooms" ref="root" class="relative h-[340svh] scroll-mt-24 motion-reduce:h-auto">
    <div
      class="sticky top-0 h-[100svh] overflow-hidden bg-ink-950 motion-reduce:static motion-reduce:h-auto"
    >
      <div class="relative h-full w-full motion-reduce:h-auto">
        <article
          v-for="(slide, index) in slides"
          :key="slide.key"
          data-slide
          class="absolute inset-0 overflow-hidden motion-reduce:relative motion-reduce:inset-auto motion-reduce:h-[78svh] motion-reduce:opacity-100"
          :class="index === 0 ? 'opacity-100' : 'opacity-0'"
        >
          <div data-slide-image class="absolute inset-0">
            <LandingImage
              v-bind="slide.image"
              :alt="t(`landing.sequence.slides.${slide.key}.imageAlt`)"
              sizes="100vw"
              :priority="slide.priority"
              img-class="h-full w-full object-cover object-center"
            />
          </div>

          <div
            class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-ink-950/30"
            aria-hidden="true"
          />

          <div
            class="relative z-10 mx-auto flex h-full max-w-screen-xl flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20"
          >
            <div data-slide-caption class="max-w-2xl">
              <p class="text-xs font-medium text-brand-300">
                {{ t(`landing.sequence.slides.${slide.key}.eyebrow`) }}
              </p>
              <p class="mt-4 text-title font-medium text-cream-50">
                {{ t(`landing.sequence.slides.${slide.key}.title`) }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-cream-100/15"
        aria-hidden="true"
      >
        <div
          data-progress
          class="h-full origin-left bg-brand-500 rtl:origin-right"
          style="transform: scaleX(0)"
        />
      </div>
    </div>
  </section>
</template>
