import type { OrderStatus } from '#shared/domain/order-status'

/**
 * Maps an OrderStatus to a BaseBadge variant. Kept out of BaseBadge itself
 * (a generic, domain-unaware primitive) per docs/design-system.md.
 */
const ORDER_STATUS_BADGE_VARIANTS: Record<OrderStatus, 'info' | 'warning' | 'brand' | 'success'> = {
  new: 'info',
  preparing: 'warning',
  ready: 'brand',
  delivered: 'success'
}

export function getOrderStatusBadgeVariant(
  status: OrderStatus
): 'info' | 'warning' | 'brand' | 'success' {
  return ORDER_STATUS_BADGE_VARIANTS[status]
}
