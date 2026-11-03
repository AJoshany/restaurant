import { OrderStatusSchema } from '#shared/schemas/order.schema'
import { getOrders } from '../../services/order.service'

/**
 * GET /api/orders?status=&sort=asc|desc - see docs/api-reference.md.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const statusParam = Array.isArray(query.status) ? query.status[0] : query.status

  const statusResult =
    statusParam !== undefined ? OrderStatusSchema.safeParse(statusParam) : undefined
  if (statusParam !== undefined && !statusResult?.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status filter' })
  }

  const sort = query.sort === 'asc' ? 'asc' : 'desc'

  const orders = await getOrders({ status: statusResult?.data, sort })
  return success(orders)
})
