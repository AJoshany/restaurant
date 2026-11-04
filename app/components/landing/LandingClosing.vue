<script setup lang="ts">
/** Static "Your table is waiting" section (reduced-motion layout). */
const { t } = useI18n()
const image = LANDING_SCENE_IMAGES.platePasta
</script>

<template>
  <section
    id="visit"
    class="relative flex min-h-[calc(100svh-4.25rem)] scroll-mt-[4.25rem] flex-col items-center overflow-hidden bg-cream-50 px-5 pb-12 pt-16 text-center sm:px-8 lg:pt-20"
  >
    <p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-tomato-700">
      {{ t('landing.closing.section') }}
    </p>

    <h2
      class="mt-5 max-w-[70rem] font-editorial text-[clamp(3rem,9vw,5.5rem)] leading-[0.92] tracking-[-0.06em] text-ink-900 sm:text-[clamp(4rem,7vw,7rem)] rtl:font-sans rtl:leading-[1.15] rtl:tracking-normal"
    >
      {{ t('landing.closing.title') }}
    </h2>

    <p
      class="mt-4 max-w-2xl font-editorial text-lg italic text-ink-800 sm:text-xl rtl:font-sans rtl:not-italic"
    >
      {{ t('landing.closing.description') }}
    </p>

    <div class="mt-6">
      <LandingAction :label="t('landing.cta.order')" />
    </div>

    <img
      :src="image.src"
      :width="image.width"
      :height="image.height"
      :alt="t('landing.closing.imageAlt')"
      loading="lazy"
      decoding="async"
      class="mt-8 h-auto w-full max-w-[60rem] object-contain"
    />
  </section>
</template>
