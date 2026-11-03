<script setup lang="ts">
import type { ResponsiveImage } from '~/utils/landing-images'

interface Props extends ResponsiveImage {
  alt: string
  /** Responsive `sizes` hint for the browser's source selection. */
  sizes?: string
  /** Above-the-fold images load eagerly with a high fetch priority. */
  priority?: boolean
  /** Layout/transform classes for the `<img>` itself (the frame is the caller's). */
  imgClass?: string
}

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<Props>(), {
  sizes: '100vw',
  priority: false,
  imgClass: 'h-full w-full object-cover'
})

function buildSrcset(small: string, large: string): string {
  return `${small} 900w, ${large} 1600w`
}
</script>

<template>
  <picture class="block h-full w-full">
    <source type="image/avif" :srcset="buildSrcset(avifSmall, avifLarge)" :sizes="sizes" />
    <source type="image/webp" :srcset="buildSrcset(webpSmall, webpLarge)" :sizes="sizes" />
    <img
      :src="webpLarge"
      :srcset="buildSrcset(webpSmall, webpLarge)"
      :sizes="sizes"
      :width="width"
      :height="height"
      :alt="alt"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      decoding="async"
      draggable="false"
      :class="imgClass"
    />
  </picture>
</template>
