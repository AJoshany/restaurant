<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)

let media: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  media = gsap.matchMedia()

  // Scroll, not load: the image push-in and the copy drift are both scrubbed
  // against the hero's own scroll range, so they reverse when scrolling back.
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const element = root.value
    if (!element) {
      return
    }

    const image = element.querySelector('[data-hero-image]')
    const copy = element.querySelectorAll('[data-hero-copy]')

    gsap
      .timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
      .to(image, { scale: 1.18, ease: 'none' }, 0)
      .to(copy, { yPercent: -22, autoAlpha: 0, ease: 'none', stagger: 0.04 }, 0)
  })
})

onBeforeUnmount(() => {
  media?.revert()
  media = null
})
</script>

<template>
  <section ref="root" class="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink-950">
    <div data-hero-image class="absolute inset-0 will-change-transform">
      <LandingImage
        v-bind="LANDING_IMAGES.diningRoom"
        :alt="t('landing.hero.imageAlt')"
        sizes="100vw"
        priority
        img-class="h-full w-full object-cover object-center"
      />
    </div>

    <div
      class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/30"
      aria-hidden="true"
    />

    <div
      class="relative z-10 mx-auto flex w-full max-w-screen-xl flex-1 flex-col justify-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:pb-20"
    >
      <p data-hero-copy class="text-xs font-medium text-brand-300">
        {{ t('landing.hero.kicker') }}
      </p>

      <h1 data-hero-copy class="mt-5 max-w-4xl text-display font-medium text-cream-50">
        <span class="block">{{ t('landing.hero.titleFirst') }}</span>
        <span class="mt-1 block text-cream-200/70">{{ t('landing.hero.titleSecond') }}</span>
      </h1>

      <div class="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-md">
          <p data-hero-copy class="text-base leading-relaxed text-cream-200/85">
            {{ t('landing.hero.description') }}
          </p>

          <div data-hero-copy class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <NuxtLink
              to="/kiosk"
              class="group inline-flex items-center gap-3 rounded-full bg-cream-50 px-7 py-4 text-base font-semibold text-ink-900 transition-colors hover:bg-brand-500 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
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

            <span class="text-xs leading-relaxed text-cream-200/60">
              {{ t('landing.cta.hint') }}
            </span>
          </div>
        </div>

        <a
          href="#rooms"
          class="hidden items-center gap-3 text-xs text-cream-200/60 transition-colors hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950 sm:inline-flex"
        >
          <span>{{ t('landing.hero.scroll') }}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            class="size-4"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m-6-6 6 6 6-6" />
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>
