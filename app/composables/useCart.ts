import { calculateOrderTotal } from '#shared/domain/order-total'
import type { Product } from '#shared/schemas/product.schema'
import type { CartItem } from '~/types/cart'

const CART_STATE_KEY = 'kiosk-cart'

/**
 * Kiosk cart state, shared across the product grid, cart panel, and cart
 * rows. Uses Nuxt's built-in `useState` rather than Pinia - the cart is
 * simple array state mutated from a handful of components within a single
 * page, which is exactly the case `useState` already covers (see "State
 * management strategy" in docs/architecture.md). Revisit if a real need for
 * cross-page persistence or more complex state emerges.
 */
export function useCart() {
  const items = useState<CartItem[]>(CART_STATE_KEY, () => [])

  function add(product: Product): void {
    const existing = items.value.find((item) => item.productId === product.id)

    if (existing) {
      existing.quantity += 1
      return
    }

    items.value.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: 1
    })
  }

  function increment(productId: string): void {
    const item = items.value.find((candidate) => candidate.productId === productId)
    if (item) {
      item.quantity += 1
    }
  }

  function decrement(productId: string): void {
    const item = items.value.find((candidate) => candidate.productId === productId)
    if (!item) {
      return
    }
    if (item.quantity <= 1) {
      remove(productId)
      return
    }
    item.quantity -= 1
  }

  function remove(productId: string): void {
    items.value = items.value.filter((item) => item.productId !== productId)
  }

  function clear(): void {
    items.value = []
  }

  function quantityFor(productId: string): number {
    return items.value.find((item) => item.productId === productId)?.quantity ?? 0
  }

  const itemCount = computed(() => items.value.reduce((count, item) => count + item.quantity, 0))
  const subtotal = computed(() => calculateOrderTotal(items.value))

  return { items, add, increment, decrement, remove, clear, quantityFor, itemCount, subtotal }
}
