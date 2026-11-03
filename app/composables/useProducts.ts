import type { ApiSuccess } from '#shared/types/api'
import type { Product } from '#shared/schemas/product.schema'

/**
 * Fetches the active product catalog for the kiosk. Prices/availability are
 * never trusted beyond display - the server re-validates everything at
 * checkout (see POST /api/orders in docs/api-reference.md).
 */
export function useProducts() {
  const { data, pending, error, refresh } = useFetch<ApiSuccess<Product[]>>('/api/products', {
    query: { activeOnly: true },
    key: 'kiosk-products'
  })

  const products = computed(() => data.value?.data ?? [])

  return { products, pending, error, refresh }
}
