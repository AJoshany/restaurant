<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { t } = useI18n()

/**
 * Progressive enhancement: the server renders the static sections (readable
 * without JS, and the reduced-motion layout). Once mounted, visitors who
 * allow motion — on any screen size — get the scroll-driven scene instead.
 * The hero is the same component pair in both, so the swap is invisible.
 */
const allowsMotion = ref(false)
let motionQuery: MediaQueryList | null = null

function updateMotion() {
  allowsMotion.value = motionQuery?.matches ?? false
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)')
  updateMotion()
  motionQuery.addEventListener('change', updateMotion)
})

onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', updateMotion)
  motionQuery = null
})

// The loaded fork is the hero's largest paint; fetch it before the CSS and
// scripts have finished so the first frame is complete.
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      type: 'image/webp',
      href: LANDING_SCENE_IMAGES.forkLoaded.src,
      fetchpriority: 'high'
    }
  ]
})

useSeoMeta({
  title: () => t('landing.meta.title'),
  description: () => t('landing.meta.description')
})
</script>

<template>
  <div>
    <main>
      <LandingExperience v-if="allowsMotion" />
      <template v-else>
        <LandingHero />
        <LandingSequence />
        <LandingClosing />
      </template>
    </main>
    <LandingPagination :key="allowsMotion ? 'motion' : 'static'" />
    <LandingFooter />
  </div>
</template>
