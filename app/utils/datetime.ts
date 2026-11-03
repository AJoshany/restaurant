/**
 * Formats an ISO 8601 instant (e.g. Order.createdAt) per the active locale,
 * for display on the staff order queue. Mirrors formatCurrencyAmount's thin
 * Intl wrapper (app/utils/currency.ts).
 */
export function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  )
}
