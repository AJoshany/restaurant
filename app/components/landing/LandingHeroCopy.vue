<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="w-full lg:max-w-[55%]">
    <p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-tomato-700">
      {{ t('landing.hero.section') }}
    </p>

    <h1
      class="mt-6 font-editorial text-[clamp(3.4rem,14.5vw,5.5rem)] leading-[0.86] tracking-[-0.075em] text-ink-900 sm:text-[clamp(4.5rem,9vw,7rem)] lg:mt-8 lg:text-[clamp(5rem,6.7vw,8rem)] rtl:font-sans rtl:leading-[1.12] rtl:tracking-normal"
    >
      <span class="block">{{ t('landing.hero.titleLine1') }}</span>
      <span class="block">{{ t('landing.hero.titleLine2') }}</span>
      <span class="block">{{ t('landing.hero.titleLine3') }}</span>
    </h1>

    <p
      class="mt-6 font-editorial text-lg italic leading-snug text-ink-800 sm:text-xl lg:mt-8 rtl:font-sans rtl:not-italic"
    >
      <span class="block">{{ t('landing.hero.descriptionFirst') }}</span>
      <span class="block">{{ t('landing.hero.descriptionSecond') }}</span>
    </p>

    <div class="mt-6 lg:mt-8">
      <LandingAction :label="t('landing.cta.explore')" />
    </div>
  </div>
</template>
