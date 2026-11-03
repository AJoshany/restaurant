import { getProducts } from '../services/product.service'

/**
 * GET /api/products?activeOnly=true - see docs/api-reference.md.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const activeOnly = query.activeOnly === 'true'

  const products = await getProducts({ activeOnly })
  return success(products)
})
