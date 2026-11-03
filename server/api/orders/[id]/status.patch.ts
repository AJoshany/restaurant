import { z } from 'zod'
import { UpdateOrderStatusRequestSchema } from '#shared/schemas/order.schema'
import { updateOrderStatus } from '../../../services/order.service'

/**
 * PATCH /api/orders/:id/status - see docs/api-reference.md. Rejects
 * transitions that don't follow the centralized status-transition policy
 * (shared/domain/order-status.ts).
 */
export default defineEventHandler(async (event) => {
  const idResult = z.string().uuid().safeParse(getRouterParam(event, 'id'))
  if (!idResult.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order id' })
  }

  const body = await readBody(event)
  const bodyResult = UpdateOrderStatusRequestSchema.safeParse(body)
  if (!bodyResult.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status payload' })
  }

  const order = await updateOrderStatus(idResult.data, bodyResult.data.status)
  return success(order)
})
