<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const { padding = 'md' } = defineProps<Props>()

const paddingClasses: Record<NonNullable<Props['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8'
}
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 bg-white shadow-sm"
    :class="paddingClasses[padding]"
  >
    <header v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </header>
    <slot />
    <footer v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </footer>
  </div>
</template>
