import { ORDER_STATUSES } from '#shared/domain/order-status'
import type { OrderStatus } from '#shared/domain/order-status'
import type { Order } from '#shared/schemas/order.schema'
import type { OrderStatusFilter } from '~/types/order-filter'

export function filterOrdersByStatus(orders: Order[], filter: OrderStatusFilter): Order[] {
  if (filter === 'all') {
    return orders
  }
  return orders.filter((order) => order.status === filter)
}

export function countOrdersByStatus(orders: Order[]): Record<OrderStatus, number> {
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >

  for (const order of orders) {
    counts[order.status] += 1
  }

  return counts
}
