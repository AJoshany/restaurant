/**
 * Centralized order status enum and transition policy. Framework-free so it
 * can be used from both app/ and server/ (see docs/architecture.md).
 */
export const ORDER_STATUSES = ['new', 'preparing', 'ready', 'delivered'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/**
 * Each status may only move forward to the next one. `delivered` is terminal.
 * No skipping and no backward transitions.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  new: ['preparing'],
  preparing: ['ready'],
  ready: ['delivered'],
  delivered: []
}

export function isValidOrderStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to)
}
