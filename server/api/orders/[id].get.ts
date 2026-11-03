import { z } from 'zod'
import { getOrderById } from '../../services/order.service'

/**
 * GET /api/orders/:id - see docs/api-reference.md.
 */
export default defineEventHandler(async (event) => {
  const idResult = z.string().uuid().safeParse(getRouterParam(event, 'id'))

  if (!idResult.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order id' })
  }

  const order = await getOrderById(idResult.data)
  return success(order)
})
