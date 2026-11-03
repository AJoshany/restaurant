/**
 * Generic setInterval-based polling: runs `callback` immediately on mount,
 * then every `intervalMs`, and cleans up on unmount. Used by useOrders to
 * drive the GET /api/orders/updates sync contract - see "Cross-browser
 * synchronization" in docs/architecture.md. Framework-reactive glue only;
 * the fetch/merge logic itself lives in the caller.
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

  onMounted(() => {
    if (immediate) {
      callback()
    }
    timer = setInterval(callback, intervalMs)
  })

  onUnmounted(() => {
    if (timer !== undefined) {
      clearInterval(timer)
    }
  })
}
