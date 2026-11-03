import type { SupportedLocaleCode } from '#shared/constants/i18n'
import type { LocalizedText } from '#shared/schemas/localized-text.schema'

/**
 * Reads the value for the active locale off a LocalizedText entity field
 * (e.g. a product name). The cast is safe because `locale` always comes from
 * `useI18n()`, which only ever yields a configured SupportedLocaleCode.
 */
export function getLocalizedText(text: LocalizedText, locale: string): string {
  return text[locale as SupportedLocaleCode]
}
