<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-4 py-10 text-center sm:py-16">
    <div v-if="$slots.icon" class="text-gray-400" aria-hidden="true">
      <slot name="icon" />
    </div>

    <div class="flex flex-col gap-1">
      <p class="text-base font-semibold text-gray-900">{{ title }}</p>
      <p v-if="description" class="text-sm text-gray-500">{{ description }}</p>
    </div>

    <div v-if="$slots.actions" class="mt-2">
      <slot name="actions" />
    </div>
  </div>
</template>
