import type { Order } from '#shared/schemas/order.schema'

/**
 * Merges a batch of changed orders (from GET /api/orders/updates) into the
 * current list by id - updated orders replace their previous entry, new
 * orders are appended, untouched orders are left alone.
 */
export function mergeOrderUpdates(current: Order[], updates: Order[]): Order[] {
  if (updates.length === 0) {
    return current
  }

  const byId = new Map(current.map((order) => [order.id, order]))
  for (const order of updates) {
    byId.set(order.id, order)
  }

  return [...byId.values()]
}
