import { z } from 'zod'
import { getOrderUpdates } from '../../services/order.service'

const SinceQuerySchema = z.string().datetime().optional()

/**
 * GET /api/orders/updates?since=<ISO datetime> - polling sync endpoint, see
 * docs/api-reference.md. Omitting `since` returns every order (initial
 * sync); otherwise only orders changed after `since`. This is a static
 * route so Nitro resolves it ahead of the dynamic `orders/[id]` segment.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sinceParam = Array.isArray(query.since) ? query.since[0] : query.since

  const parsed = SinceQuerySchema.safeParse(sinceParam)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid since parameter' })
  }

  const updates = await getOrderUpdates(parsed.data)
  return success(updates)
})
