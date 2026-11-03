<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="bg-brand-600">
    <div
      class="mx-auto flex max-w-screen-xl flex-col items-center gap-4 px-6 py-12 text-center sm:py-16"
    >
      <h2 class="text-xl font-semibold text-white sm:text-2xl">{{ t('landing.cta.title') }}</h2>
      <p class="max-w-prose text-base text-brand-50">{{ t('landing.cta.subtitle') }}</p>
      <NuxtLink to="/kiosk" class="mt-2">
        <BaseButton variant="secondary" size="lg">{{ t('landing.cta.button') }}</BaseButton>
      </NuxtLink>
    </div>
  </section>
</template>
