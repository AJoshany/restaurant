<script setup lang="ts">
import { SUPPORTED_LOCALES } from '#shared/constants/i18n'

const { t, locale, setLocale } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-gray-200 bg-white">
    <div
      class="mx-auto flex max-w-screen-xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-start"
    >
      <div>
        <p class="text-sm font-semibold text-gray-900">{{ t('app.name') }}</p>
        <p class="text-sm text-gray-500">{{ t('landing.footer.tagline') }}</p>
      </div>

      <nav class="flex items-center gap-4 text-sm text-gray-600">
        <NuxtLink to="/" class="hover:text-brand-600">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink to="/kiosk" class="hover:text-brand-600">{{ t('nav.kiosk') }}</NuxtLink>
      </nav>

      <div class="flex items-center gap-1" role="group" :aria-label="t('common.switchLocale')">
        <button
          v-for="supportedLocale in SUPPORTED_LOCALES"
          :key="supportedLocale.code"
          type="button"
          class="rounded-md border px-2.5 py-1 text-xs font-medium"
          :class="
            locale === supportedLocale.code
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-gray-300 text-gray-600'
          "
          @click="setLocale(supportedLocale.code)"
        >
          {{ supportedLocale.name }}
        </button>
      </div>
    </div>

    <p class="pb-6 text-center text-xs text-gray-400">
      {{ t('landing.footer.rights', { year: currentYear, appName: t('app.name') }) }}
    </p>
  </footer>
</template>
