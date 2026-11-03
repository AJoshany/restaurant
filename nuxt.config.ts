import tailwindcss from '@tailwindcss/vite'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './shared/constants/i18n'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  components: {
    dirs: [{ path: '~/components/ui', pathPrefix: false }]
  },
  vite: {
    plugins: [tailwindcss()]
  },
  eslint: {
    config: {
      stylistic: false
    }
  },
  typescript: {
    strict: true
  },
  i18n: {
    locales: SUPPORTED_LOCALES.map(({ code, language, file, dir }) => ({
      code,
      language,
      file,
      dir
    })),
    defaultLocale: DEFAULT_LOCALE,
    strategy: 'no_prefix'
  }
})
