import type { Order } from '#shared/schemas/order.schema'
import type { OrderSortOption } from '~/types/order-sort'

/**
 * Comparators for admin's user-controlled sort (GET /api/orders/updates has
 * no server-side sort param, unlike GET /api/orders - see
 * docs/api-reference.md - so sorting happens client-side on the already
 * synced list). Mirrors the Record-based mapping in order-status-badge.ts.
 */
const SORT_COMPARATORS: Record<OrderSortOption, (a: Order, b: Order) => number> = {
  newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  oldest: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  totalDesc: (a, b) => b.totalAmount - a.totalAmount,
  totalAsc: (a, b) => a.totalAmount - b.totalAmount
}

export const ORDER_SORT_OPTIONS = Object.keys(SORT_COMPARATORS) as OrderSortOption[]

export function sortOrders(orders: Order[], sort: OrderSortOption): Order[] {
  return [...orders].sort(SORT_COMPARATORS[sort])
}
