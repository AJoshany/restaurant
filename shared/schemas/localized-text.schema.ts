import { z } from 'zod'
import { SUPPORTED_LOCALES, type SupportedLocaleCode } from '../constants/i18n'

/**
 * A piece of text with one value per supported locale (e.g. a product name).
 * Keys are derived from SUPPORTED_LOCALES so the locale list is never
 * hardcoded a second time here.
 */
const localizedTextShape = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale.code, z.string().min(1)])
) as Record<SupportedLocaleCode, z.ZodString>

export const LocalizedTextSchema = z.object(localizedTextShape)

export type LocalizedText = z.infer<typeof LocalizedTextSchema>
