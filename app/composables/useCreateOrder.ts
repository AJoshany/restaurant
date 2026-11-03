import type { ApiSuccess } from '#shared/types/api'
import type { CreateOrderItemRequest, Order } from '#shared/schemas/order.schema'

/**
 * Submits a cart as an order via POST /api/orders. The server recomputes
 * prices/totals from the current product catalog - this composable never
 * sends them (see docs/api-reference.md).
 */
export function useCreateOrder() {
  const pending = ref(false)
  const error = ref(false)

  async function submit(items: CreateOrderItemRequest[]): Promise<Order | null> {
    pending.value = true
    error.value = false

    try {
      const response = await $fetch<ApiSuccess<Order>>('/api/orders', {
        method: 'POST',
        body: { items }
      })
      return response.data
    } catch {
      error.value = true
      return null
    } finally {
      pending.value = false
    }
  }

  return { pending, error, submit }
}
