import type { ApiSuccess } from '#shared/types/api'
import type { Order } from '#shared/schemas/order.schema'
import type { OrderStatus } from '#shared/domain/order-status'

/**
 * Submits a status transition via PATCH /api/orders/:id/status (mirrors
 * useCreateOrder's shape). Tracks pending/error state per order id so one
 * card's in-flight update doesn't disable every other card.
 */
export function useUpdateOrderStatus() {
  const pendingOrderIds = ref<Set<string>>(new Set())
  const errorOrderIds = ref<Set<string>>(new Set())

  async function updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    pendingOrderIds.value = new Set(pendingOrderIds.value).add(id)
    errorOrderIds.value = new Set([...errorOrderIds.value].filter((candidate) => candidate !== id))

    try {
      const response = await $fetch<ApiSuccess<Order>>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: { status }
      })
      return response.data
    } catch {
      errorOrderIds.value = new Set(errorOrderIds.value).add(id)
      return null
    } finally {
      pendingOrderIds.value = new Set(
        [...pendingOrderIds.value].filter((candidate) => candidate !== id)
      )
    }
  }

  return { pendingOrderIds, errorOrderIds, updateStatus }
}
