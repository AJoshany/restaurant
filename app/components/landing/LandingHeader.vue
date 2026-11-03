<script setup lang="ts">
import { SUPPORTED_LOCALES } from '#shared/constants/i18n'

const { t, locale, setLocale } = useI18n()
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-6 py-4">
      <NuxtLink to="/" class="text-lg font-semibold text-brand-600">
        {{ t('app.name') }}
      </NuxtLink>

      <nav class="hidden items-center gap-6 text-sm font-medium text-gray-700 sm:flex">
        <NuxtLink to="/" class="text-brand-600">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink to="/kiosk" class="hover:text-brand-600">{{ t('nav.kiosk') }}</NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <div
          class="hidden items-center gap-1 sm:flex"
          role="group"
          :aria-label="t('common.switchLocale')"
        >
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

        <NuxtLink to="/kiosk">
          <BaseButton size="sm">{{ t('landing.header.orderNow') }}</BaseButton>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
