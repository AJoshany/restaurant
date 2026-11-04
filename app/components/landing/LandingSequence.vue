<script setup lang="ts">
/** Static "A little bit of everything" section (reduced-motion layout). */
const { t } = useI18n()
const image = LANDING_SCENE_IMAGES.pastaSwirl
</script>

<template>
  <section
    id="story"
    class="relative scroll-mt-[4.25rem] overflow-hidden bg-cream-50 px-5 py-16 sm:px-8 lg:py-24"
  >
    <div
      class="mx-auto grid max-w-screen-xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
    >
      <div>
        <p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-tomato-700">
          {{ t('landing.story.section') }}
        </p>

        <h2
          class="mt-6 font-editorial text-[clamp(3.2rem,9vw,5.5rem)] leading-[0.9] tracking-[-0.065em] text-ink-900 sm:text-[clamp(4.5rem,7vw,7rem)] lg:mt-8 lg:text-[clamp(5rem,6vw,7.5rem)] rtl:font-sans rtl:leading-[1.15] rtl:tracking-normal"
        >
          <span class="block">{{ t('landing.story.titleLine1') }}</span>
          <span class="block">{{ t('landing.story.titleLine2') }}</span>
        </h2>

        <p
          class="mt-7 max-w-xl font-editorial text-lg italic leading-snug text-ink-800 sm:text-xl rtl:font-sans rtl:not-italic"
        >
          <span class="block">{{ t('landing.story.descriptionFirst') }}</span>
          <span class="block">{{ t('landing.story.descriptionSecond') }}</span>
        </p>

        <div class="mt-6 lg:mt-8">
          <LandingAction :label="t('landing.cta.explore')" />
        </div>
      </div>

      <img
        :src="image.src"
        :width="image.width"
        :height="image.height"
        :alt="t('landing.story.imageAlt')"
        loading="lazy"
        decoding="async"
        class="mx-auto h-[min(68svh,40rem)] w-auto object-contain"
      />
    </div>
  </section>
</template>
