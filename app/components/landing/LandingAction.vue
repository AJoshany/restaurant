<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <NuxtLink
    to="/kiosk"
    class="group inline-flex w-fit items-center gap-3 rounded-full text-xs font-semibold uppercase tracking-[0.08em] text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato-700 focus-visible:ring-offset-4 focus-visible:ring-offset-cream-50"
  >
    <span
      class="rounded-full bg-tomato-700 px-6 py-3.5 transition-colors group-hover:bg-tomato-800"
    >
      {{ label }}
    </span>
    <span
      class="flex size-11 items-center justify-center rounded-full border border-ink-900/60 text-ink-900 transition-colors group-hover:border-tomato-700 group-hover:bg-tomato-700 group-hover:text-cream-50"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="size-5 rtl:rotate-180"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 12h15m-6-6 6 6-6 6" />
      </svg>
    </span>
  </NuxtLink>
</template>
