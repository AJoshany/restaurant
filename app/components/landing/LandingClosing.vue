<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)

let media: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  media = gsap.matchMedia()

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const element = root.value
    if (!element) {
      return
    }

    const image = element.querySelector('[data-closing-image]')
    const content = element.querySelector('[data-closing-content]')

    gsap
      .timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
      .fromTo(image, { scale: 1.06, yPercent: 2 }, { scale: 1.18, yPercent: -3, ease: 'none' }, 0)
      .fromTo(content, { yPercent: 6 }, { yPercent: -6, ease: 'none' }, 0)
  })
})

onBeforeUnmount(() => {
  media?.revert()
  media = null
})
</script>

<template>
  <section
    id="visit"
    ref="root"
    class="relative flex min-h-[92svh] scroll-mt-24 flex-col justify-center overflow-hidden bg-ink-950 py-24 sm:py-32"
  >
    <div data-closing-image class="absolute inset-0 will-change-transform">
      <LandingImage
        v-bind="LANDING_IMAGES.privateTable"
        :alt="t('landing.closing.imageAlt')"
        sizes="100vw"
        img-class="h-full w-full object-cover object-center"
      />
    </div>

    <div class="absolute inset-0 bg-ink-950/75" aria-hidden="true" />
    <div
      class="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/80"
      aria-hidden="true"
    />

    <div
      data-closing-content
      class="relative z-10 mx-auto flex w-full max-w-screen-xl flex-col items-center px-5 text-center sm:px-8"
    >
      <p class="text-xs font-medium text-brand-300">{{ t('landing.closing.kicker') }}</p>

      <h2 class="mt-6 max-w-3xl text-title font-medium text-cream-50">
        {{ t('landing.closing.title') }}
      </h2>

      <p class="mt-5 max-w-lg text-base leading-relaxed text-cream-200/75">
        {{ t('landing.closing.body') }}
      </p>

      <NuxtLink
        to="/kiosk"
        class="mt-9 inline-flex items-center gap-3 rounded-full bg-cream-50 px-8 py-4 text-base font-semibold text-ink-900 transition-colors hover:bg-brand-500 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
      >
        <span>{{ t('landing.cta.order') }}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          class="size-4 rtl:rotate-180"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 12h15m-6-6 6 6-6 6" />
        </svg>
      </NuxtLink>

      <div
        class="mt-10 flex flex-col items-center gap-2 text-xs text-cream-200/55 sm:flex-row sm:gap-5"
      >
        <span>{{ t('landing.closing.hours') }}</span>
        <span class="hidden size-0.5 rounded-full bg-cream-200/40 sm:block" aria-hidden="true" />
        <span>{{ t('landing.closing.address') }}</span>
      </div>
    </div>
  </section>
</template>
