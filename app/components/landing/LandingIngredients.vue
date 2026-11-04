<script setup lang="ts">
/**
 * The scene's free-floating ingredients. Each one is three nested layers so
 * no two systems ever write the same transform:
 *   slot  — positioned by CSS (responsive, RTL-aware), never transformed
 *   body  — driven by the scrubbed timeline (`landing-scene.ts`)
 *   img   — driven by the idle float ticker (`landing-float.ts`)
 * Placement and choreography come from `LANDING_INGREDIENTS`; entries
 * without a `compact` placement are desktop-only.
 */
const ingredients = LANDING_INGREDIENTS.map((ingredient, index) => ({
  index,
  image: LANDING_INGREDIENT_IMAGES[ingredient.image],
  className: [
    ingredient.depth === 'front' ? 'z-30' : 'z-[15]',
    ingredient.compact ? '' : 'max-lg:hidden'
  ],
  // Mirrored on the img, never the slot: a flipped slot would invert the
  // body's x-axis and send the ingredient the wrong way.
  imgClass: ingredient.mirrored ? '-scale-x-100' : '',
  style: {
    '--size': ingredient.size,
    '--x-d': `${ingredient.desktop.x}%`,
    '--y-d': `${ingredient.desktop.y}%`,
    '--x-c': `${ingredient.compact?.x ?? ingredient.desktop.x}%`,
    '--y-c': `${ingredient.compact?.y ?? ingredient.desktop.y}%`
  }
}))
</script>

<template>
  <div
    v-for="ingredient in ingredients"
    :key="ingredient.index"
    :data-ingredient-slot="ingredient.index"
    class="pointer-events-none absolute start-(--x-c) top-(--y-c) w-[calc(var(--ingredient-scale)*var(--size)*1vmin)] -translate-x-1/2 -translate-y-1/2 lg:start-(--x-d) lg:top-(--y-d) rtl:translate-x-1/2"
    :class="ingredient.className"
    :style="ingredient.style"
    aria-hidden="true"
  >
    <div data-ingredient class="invisible opacity-0 will-change-transform">
      <img
        data-ingredient-bob
        :src="ingredient.image.src"
        :width="ingredient.image.width"
        :height="ingredient.image.height"
        alt=""
        fetchpriority="low"
        decoding="async"
        draggable="false"
        class="block h-auto w-full"
        :class="ingredient.imgClass"
      />
    </div>
  </div>
</template>
