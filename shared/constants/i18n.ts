export const SUPPORTED_LOCALES = [
  { code: 'en-US', language: 'en-US', dir: 'ltr', file: 'en-US.json', name: 'English' },
  { code: 'fa-IR', language: 'fa-IR', dir: 'rtl', file: 'fa-IR.json', name: 'فارسی' }
] as const

export type SupportedLocaleCode = (typeof SUPPORTED_LOCALES)[number]['code']

export const DEFAULT_LOCALE: SupportedLocaleCode = 'en-US'
