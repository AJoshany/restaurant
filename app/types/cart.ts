import type { LocalizedText } from '#shared/schemas/localized-text.schema'

/**
 * A line in the kiosk cart. `name`/`unitPrice` are a display-only snapshot
 * taken when the item was added - the server re-validates against the
 * current product on checkout (see POST /api/orders in docs/api-reference.md),
 * so this snapshot is never trusted for pricing.
 */
export interface CartItem {
  productId: string
  name: LocalizedText
  image: string
  unitPrice: number
  quantity: number
}
