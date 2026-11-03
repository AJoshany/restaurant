<script setup lang="ts">
interface Props {
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

const { variant = 'neutral', size = 'md' } = defineProps<Props>()

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  brand: 'bg-brand-100 text-brand-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-info-50 text-info-700'
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm'
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-medium"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <slot />
  </span>
</template>
