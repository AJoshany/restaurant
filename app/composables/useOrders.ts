import type { ApiSuccess } from '#shared/types/api'
import type { Order, OrderUpdates } from '#shared/schemas/order.schema'

/**
 * Keeps `orders` in sync with the server via GET /api/orders/updates,
 * polling well under the 5-second cross-browser sync target (see
 * docs/architecture.md). The initial load goes through `useFetch` (like
 * useProducts) so it's SSR-aware - the queue is already populated in the
 * server-rendered payload instead of only appearing after client hydration.
 * `orders` is a computed that reads straight from that SSR-fetched `data`
 * until the first poll tick lands in `polledOrders` - deriving it via a
 * computed (rather than a watcher writing into a separate ref) avoids an
 * SSR timing gap where a watcher's effect wouldn't flush before the page is
 * rendered to a string.
 *
 * Every tick after the first is a client-only `$fetch` passing the previous
 * `serverTime` as `since`, merged by id (mergeOrderUpdates). A failed poll
 * keeps the previous cursor/orders and retries next tick, per the contract
 * in docs/api-reference.md - it never advances the cursor on failure, so no
 * update is silently skipped.
 *
 * The `useFetch` key is unique per call (`useId`, stable between SSR and
 * hydration) rather than a shared constant. With one shared key, staff and
 * admin reuse the same entry: navigating from one to the other mounts the
 * new page with the previous page's snapshot, no request is sent, and it
 * stays stale until the next 3s poll (verified in a browser - even with
 * `getCachedData: () => undefined`). A fresh key per mount means every
 * navigation starts with no data, `pending` true (the page shows its
 * loading state) and a real request fired immediately.
 */
export function useOrders() {
  const { data, pending, error, refresh } = useFetch<ApiSuccess<OrderUpdates>>(
    '/api/orders/updates',
    { key: `order-updates-${useId()}` }
  )

  const polledOrders = ref<Order[] | null>(null)
  const cursor = ref<string | null>(null)

  const orders = computed(() => polledOrders.value ?? data.value?.data.orders ?? [])

  async function poll() {
    const since = cursor.value ?? data.value?.data.serverTime
    if (!since) {
      return
    }

    try {
      const response = await $fetch<ApiSuccess<OrderUpdates>>('/api/orders/updates', {
        query: { since }
      })
      polledOrders.value = mergeOrderUpdates(orders.value, response.data.orders)
      cursor.value = response.data.serverTime
    } catch {
      // Keep the previous cursor/orders and retry on the next tick.
    }
  }

  const { isResuming: isSyncing } = usePolling(poll, 3000, { immediate: false })

  function applyUpdatedOrder(order: Order) {
    polledOrders.value = mergeOrderUpdates(orders.value, [order])
  }

  return { orders, pending, error, refresh, applyUpdatedOrder, isSyncing }
}
