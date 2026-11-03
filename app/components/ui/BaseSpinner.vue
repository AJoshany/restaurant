<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  /** Accessible label. Omit for a decorative spinner (e.g. inside a button
   * that already announces its own busy state). */
  label?: string
}

const { size = 'md', label = undefined } = defineProps<Props>()

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]'
}
</script>

<template>
  <span
    class="inline-block animate-spin rounded-full border-current border-t-transparent text-brand-600"
    :class="sizeClasses[size]"
    :role="label ? 'status' : undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <span v-if="label" class="sr-only">{{ label }}</span>
  </span>
</template>
