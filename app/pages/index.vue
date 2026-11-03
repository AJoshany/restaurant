<script setup lang="ts">
import { SUPPORTED_LOCALES } from '#shared/constants/i18n'

const { t, locale, setLocale } = useI18n()
</script>

<template>
  <main class="mx-auto flex max-w-screen-sm flex-col gap-4 p-6 text-center">
    <h1 class="text-2xl font-semibold text-brand-600">{{ t('app.name') }}</h1>
    <p class="text-base">{{ t('common.comingSoon') }}</p>

    <div class="flex justify-center gap-2" role="group" :aria-label="t('common.switchLocale')">
      <button
        v-for="supportedLocale in SUPPORTED_LOCALES"
        :key="supportedLocale.code"
        type="button"
        class="rounded-md border px-3 py-1 text-sm"
        :class="
          locale === supportedLocale.code ? 'border-brand-500 bg-brand-50' : 'border-gray-300'
        "
        @click="setLocale(supportedLocale.code)"
      >
        {{ supportedLocale.name }}
      </button>
    </div>
  </main>
</template>
