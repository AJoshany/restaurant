<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const copy = ref<HTMLElement | null>(null)

const detailKeys = ['fire', 'market', 'menu'] as const

let media: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  media = gsap.matchMedia()

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const image = frame.value?.querySelector('[data-kitchen-image] img')
    if (image && frame.value) {
      // The image is 116% of its frame, so ±4% of vertical drift never exposes
      // an edge. Progress follows the frame through the viewport both ways.
      gsap.fromTo(
        image,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: frame.value,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      )
    }

    const revealItems = copy.value?.querySelectorAll('[data-reveal]')
    if (revealItems && copy.value) {
      gsap.fromTo(
        revealItems,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: copy.value,
            start: 'top 85%',
            end: 'top 45%',
            scrub: true
          }
        }
      )
    }
  })
})

onBeforeUnmount(() => {
  media?.revert()
  media = null
})
</script>

<template>
  <section
    id="kitchen"
    ref="root"
    class="relative scroll-mt-24 overflow-hidden bg-ink-900 py-20 lg:py-32"
  >
    <div
      class="mx-auto grid max-w-screen-xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20"
    >
      <div
        ref="frame"
        class="relative aspect-[4/3] overflow-hidden bg-ink-800 sm:aspect-[16/11] lg:aspect-[4/5]"
      >
        <div data-kitchen-image class="absolute -inset-y-[8%] inset-x-0">
          <LandingImage
            v-bind="LANDING_IMAGES.kitchen"
            :alt="t('landing.sequence.slides.kitchen.imageAlt')"
            sizes="(min-width: 1024px) 50vw, 100vw"
            img-class="h-full w-full object-cover object-center will-change-transform"
          />
        </div>
      </div>

      <div ref="copy" class="flex flex-col items-start">
        <p data-reveal class="text-xs font-medium text-brand-300">
          {{ t('landing.kitchen.eyebrow') }}
        </p>

        <h2 data-reveal class="mt-5 text-title font-medium text-cream-50">
          {{ t('landing.kitchen.title') }}
        </h2>

        <p data-reveal class="mt-6 max-w-prose text-base leading-relaxed text-cream-200/70">
          {{ t('landing.kitchen.body') }}
        </p>

        <dl class="mt-10 w-full border-t border-cream-100/10">
          <div
            v-for="key in detailKeys"
            :key="key"
            data-reveal
            class="flex flex-wrap items-baseline justify-between gap-2 border-b border-cream-100/10 py-4"
          >
            <dt class="text-sm text-cream-200/50">
              {{ t(`landing.kitchen.details.${key}.label`) }}
            </dt>
            <dd class="text-sm text-cream-100">{{ t(`landing.kitchen.details.${key}.value`) }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
