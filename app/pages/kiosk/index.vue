<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <main class="mx-auto max-w-screen-sm p-6 text-center">
    <h1 class="text-xl font-semibold">{{ t('nav.kiosk') }}</h1>
    <p>{{ t('common.comingSoon') }}</p>
  </main>
</template>
