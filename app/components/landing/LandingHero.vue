<script setup lang="ts">
/**
 * Static hero: the server-rendered first paint, and the whole hero for
 * visitors who prefer reduced motion. Shares its copy and artwork with the
 * scroll-driven scene, so swapping to the scene after hydration is seamless.
 */
</script>

<template>
  <section
    id="home"
    class="relative isolate h-[100svh] min-h-[40rem] scroll-mt-20 overflow-hidden bg-cream-50"
  >
    <LandingHeroArt />

    <div
      class="relative z-10 mx-auto flex h-full w-full max-w-screen-xl flex-col justify-start px-5 pt-[6.25rem] sm:px-8 sm:pt-[7.5rem] lg:justify-center lg:pt-20"
    >
      <LandingHeroCopy />
    </div>
  </section>
</template>
