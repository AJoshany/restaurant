/**
 * Formats a non-negative integer amount (smallest whole currency unit, see
 * docs/data-model.md#pricing--totals) per the active locale. The currency
 * unit label itself is UI chrome, not data, so callers append it from
 * i18n (`kiosk.currencyUnit`) rather than this util hardcoding one.
 */
export function formatCurrencyAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(amount)
}
