import { CreateOrderRequestSchema } from '#shared/schemas/order.schema'
import { createOrder } from '../../services/order.service'

/**
 * POST /api/orders - see docs/api-reference.md. Prices/totals are never
 * trusted from the client; the service recomputes them from current product
 * data.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = CreateOrderRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order payload' })
  }

  const order = await createOrder(parsed.data)
  return success(order)
})
