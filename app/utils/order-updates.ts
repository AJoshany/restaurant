import type { Order } from '#shared/schemas/order.schema'

/**
 * Merges a batch of changed orders (from GET /api/orders/updates) into the
 * current list by id - updated orders replace their previous entry, new
 * orders are appended, untouched orders are left alone.
 *
 * Only replaces an existing entry if the incoming `updatedAt` is the same age
 * or newer. Two update sources race against the same local state - the 3s
 * poll tick and a direct PATCH response applied via `applyUpdatedOrder` - and
 * network/response timing doesn't guarantee they arrive in server order, so
 * a slower, older response must not clobber a newer one already applied.
 */
export function mergeOrderUpdates(current: Order[], updates: Order[]): Order[] {
  if (updates.length === 0) {
    return current
  }

  const byId = new Map(current.map((order) => [order.id, order]))
  for (const order of updates) {
    const existing = byId.get(order.id)
    if (
      !existing ||
      new Date(order.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()
    ) {
      byId.set(order.id, order)
    }
  }

  return [...byId.values()]
}
