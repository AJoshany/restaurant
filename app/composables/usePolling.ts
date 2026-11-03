/**
 * Generic setInterval-based polling: runs `callback` immediately on mount,
 * then every `intervalMs`, and cleans up on unmount. Used by useOrders to
 * drive the GET /api/orders/updates sync contract - see "Cross-browser
 * synchronization" in docs/architecture.md. Framework-reactive glue only;
 * the fetch/merge logic itself lives in the caller.
 *
 * A tick is skipped if the previous one is still in flight (e.g. a slow
 * network response taking longer than `intervalMs`), so overlapping calls to
 * `callback` can never race each other out of server order.
 */
export interface UsePollingOptions {
  /** Whether to run `callback` once immediately on mount. Default `true`. */
  immediate?: boolean
}

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs = 3000,
  options: UsePollingOptions = {}
): void {
  const { immediate = true } = options
  let timer: ReturnType<typeof setInterval> | undefined
  let isTickRunning = false

  async function tick() {
    if (isTickRunning) {
      return
    }
    isTickRunning = true
    try {
      await callback()
    } finally {
      isTickRunning = false
    }
  }

  onMounted(() => {
    if (immediate) {
      tick()
    }
    timer = setInterval(tick, intervalMs)
  })

  onUnmounted(() => {
    if (timer !== undefined) {
      clearInterval(timer)
    }
  })
}
