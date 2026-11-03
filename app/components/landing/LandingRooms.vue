<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)

const rooms = [
  { key: 'mainHall', image: LANDING_IMAGES.mainHall },
  { key: 'heritageRoom', image: LANDING_IMAGES.heritageRoom },
  { key: 'privateTable', image: LANDING_IMAGES.privateTable }
] as const

let media: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  media = gsap.matchMedia()

  /**
   * Desktop pins the panel (CSS `sticky`) and translates the row horizontally,
   * scrubbed across the section's scroll length. Mobile keeps a normal vertical
   * stack and gives each photograph a scroll-scrubbed push-in instead — the
   * same input, a layout that actually fits a small screen.
   */
  media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const section = root.value
    const row = track.value
    if (!section || !row) {
      return
    }

    // In RTL the row overflows to the left, so it must travel the other way.
    const travelsLeft = getComputedStyle(document.documentElement).direction !== 'rtl'
    const distance = () => Math.max(0, row.scrollWidth - window.innerWidth + 32)

    gsap.to(row, {
      x: () => (travelsLeft ? -distance() : distance()),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true
      }
    })
  })

  media.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
    const section = root.value
    if (!section) {
      return
    }

    section.querySelectorAll<HTMLElement>('[data-room-card]').forEach((card) => {
      const image = card.querySelector('[data-room-image] img')
      if (!image) {
        return
      }

      gsap.fromTo(
        image,
        { scale: 1.1 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      )
    })
  })
})

onBeforeUnmount(() => {
  media?.revert()
  media = null
})
</script>

<template>
  <section
    id="spaces"
    ref="root"
    class="relative scroll-mt-24 bg-ink-950 lg:h-[300svh] motion-reduce:h-auto"
  >
    <div
      class="overflow-hidden py-20 lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0 lg:motion-reduce:static lg:motion-reduce:h-auto lg:motion-reduce:py-20"
    >
      <div class="mx-auto w-full max-w-screen-xl px-5 sm:px-8">
        <p class="text-xs font-medium text-brand-300">{{ t('landing.rooms.eyebrow') }}</p>
        <h2 class="mt-5 text-title font-medium text-cream-50">{{ t('landing.rooms.title') }}</h2>
        <p class="mt-4 max-w-xl text-base leading-relaxed text-cream-200/70">
          {{ t('landing.rooms.intro') }}
        </p>
      </div>

      <div
        ref="track"
        class="mt-10 flex flex-col gap-12 px-5 sm:px-8 lg:mt-12 lg:w-max lg:flex-row lg:gap-8 lg:px-[max(2rem,calc((100vw-80rem)/2))] lg:motion-reduce:w-full lg:motion-reduce:flex-col"
      >
        <article
          v-for="(room, index) in rooms"
          :key="room.key"
          data-room-card
          class="lg:w-[32rem] lg:shrink-0 xl:w-[36rem]"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-ink-800 lg:aspect-auto lg:h-[36svh]">
            <div data-room-image class="absolute inset-0">
              <LandingImage
                v-bind="room.image"
                :alt="t(`landing.rooms.${room.key}.imageAlt`)"
                sizes="(min-width: 1024px) 36rem, 100vw"
                img-class="h-full w-full object-cover object-center will-change-transform"
              />
            </div>
          </div>

          <div class="mt-5 flex items-baseline justify-between gap-4">
            <h3 class="text-xl font-medium text-cream-50">
              {{ t(`landing.rooms.${room.key}.name`) }}
            </h3>
            <span class="text-xs text-cream-200/40">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </div>

          <p class="mt-2 max-w-md text-sm leading-relaxed text-cream-200/60">
            {{ t(`landing.rooms.${room.key}.description`) }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
