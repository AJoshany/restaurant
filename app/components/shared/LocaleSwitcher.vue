<script setup lang="ts">
import { SUPPORTED_LOCALES } from '#shared/constants/i18n'
import type { SupportedLocaleCode } from '#shared/constants/i18n'

interface Props {
  /**
   * `light` is the default app chrome (white header). `dark` is for
   * photography-backed surfaces (the public landing page), where the light
   * borders/text would be unreadable.
   */
  variant?: 'light' | 'dark'
}

const { variant = 'light' } = defineProps<Props>()

const { t, locale, setLocale } = useI18n()

const variantClasses: Record<NonNullable<Props['variant']>, { active: string; idle: string }> = {
  light: {
    active: 'border-brand-500 bg-brand-50 text-brand-700',
    idle: 'border-gray-300 text-gray-600 hover:bg-gray-50'
  },
  dark: {
    active: 'border-brand-400 bg-brand-500/20 text-brand-100',
    idle: 'border-cream-100/25 text-cream-200/80 hover:border-cream-100/50 hover:text-cream-50'
  }
}

// `strategy: 'no_prefix'` (nuxt.config.ts) switches the locale in place, so the
// current route — including any query string — is preserved.
function changeLocale(code: SupportedLocaleCode) {
  void setLocale(code)
}
</script>

<template>
  <div class="flex items-center gap-1" role="group" :aria-label="t('common.switchLocale')">
    <button
      v-for="supportedLocale in SUPPORTED_LOCALES"
      :key="supportedLocale.code"
      type="button"
      :lang="supportedLocale.language"
      :aria-pressed="locale === supportedLocale.code"
      class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      :class="[
        locale === supportedLocale.code
          ? variantClasses[variant].active
          : variantClasses[variant].idle,
        variant === 'dark' ? 'focus-visible:ring-offset-ink-950' : ''
      ]"
      @click="changeLocale(supportedLocale.code)"
    >
      {{ supportedLocale.name }}
    </button>
  </div>
</template>
