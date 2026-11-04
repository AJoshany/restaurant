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
 *
 * Also refreshes right away when the user comes back to the tab (it becomes
 * visible, or its window regains focus - e.g. switching to an already-open
 * `/staff` or `/admin` tab/window). Without this, a tab left in the
 * background only picks up changes made elsewhere on its next scheduled tick.
 * `isResuming` is true from that moment until the refresh finishes, so the
 * caller can show a loading state instead of data that may be out of date.
 */
export interface UsePollingOptions {
  /** Whether to run `callback` once immediately on mount. Default `true`. */
  immediate?: boolean
}

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs = 3000,
  options: UsePollingOptions = {}
) {
  const { immediate = true } = options
  const isResuming = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined
  let inFlight: Promise<void> | null = null

  function tick(): Promise<void> {
    if (inFlight) {
      return inFlight
    }
    inFlight = (async () => {
      try {
        await callback()
      } finally {
        inFlight = null
      }
    })()
    return inFlight
  }

  async function refreshOnResume() {
    if (isResuming.value) {
      return
    }
    isResuming.value = true
    try {
      // A tick already in flight may have been issued before the change we're
      // resuming for, so let it finish and then run a fresh one.
      if (inFlight) {
        await inFlight
      }
      await tick()
    } finally {
      isResuming.value = false
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      refreshOnResume()
    }
  }

  onMounted(() => {
    if (immediate) {
      tick()
    }
    timer = setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', refreshOnResume)
  })

  onUnmounted(() => {
    if (timer !== undefined) {
      clearInterval(timer)
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', refreshOnResume)
  })

  return { isResuming: readonly(isResuming) }
}
