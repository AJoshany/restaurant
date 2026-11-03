<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('landing.meta.title'),
  description: () => t('landing.meta.description')
})
</script>

<template>
  <div>
    <main>
      <LandingHero />
      <LandingSequence />
      <LandingKitchen />
      <LandingRooms />
      <LandingClosing />
    </main>
    <LandingFooter />
  </div>
</template>
