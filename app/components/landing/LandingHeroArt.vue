<script setup lang="ts">
/**
 * The hero's food composition: the tomato-red panel and the loaded fork. The
 * static hero and the scroll-driven scene both render it, so the hand-over
 * from server HTML to the animated scene after hydration is pixel-identical.
 * The scene passes the fork's two cut-outs through the default slot; they
 * stack exactly on top of the photograph inside the same stage.
 *
 * The photograph is never mirrored (its lighting would read wrong), so in
 * RTL the fork's tines face the screen edge; the `rtl:` offsets pull the
 * stage in far enough to keep them in frame.
 */
const { t } = useI18n()
const image = LANDING_SCENE_IMAGES.forkLoaded
</script>

<template>
  <div
    data-red-panel
    class="absolute inset-x-0 bottom-0 top-[57%] bg-tomato-700 sm:top-[55%] lg:start-[55%] lg:top-[4.25rem]"
    aria-hidden="true"
  />

  <div
    data-fork-stage
    class="pointer-events-none absolute -end-[7%] top-[50%] z-[25] aspect-[1022/1539] h-[60svh] sm:end-[2%] sm:top-[46%] sm:h-[66svh] lg:-end-[3%] lg:top-[1%] lg:h-[114svh] rtl:end-[1%] rtl:top-[55%] sm:rtl:end-[4%] sm:rtl:top-[46%] lg:rtl:end-[1%] lg:rtl:top-[1%]"
  >
    <img
      data-full-fork
      :src="image.src"
      :width="image.width"
      :height="image.height"
      :alt="t('landing.hero.imageAlt')"
      fetchpriority="high"
      decoding="async"
      draggable="false"
      class="absolute inset-0 h-full w-full object-contain will-change-transform"
    />
    <slot />
  </div>
</template>
