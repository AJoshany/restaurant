/**
 * Reveals an element once it scrolls into the viewport, via IntersectionObserver.
 * Falls back to immediately visible when IntersectionObserver isn't available
 * (older browsers, non-DOM test environments).
 */
export function useScrollReveal(options: { threshold?: number } = {}) {
  const target = ref<HTMLElement | null>(null)
  const isVisible = ref(false)

  onMounted(() => {
    if (!target.value || typeof IntersectionObserver === 'undefined') {
      isVisible.value = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          isVisible.value = true
          observer.disconnect()
        }
      },
      { threshold: options.threshold ?? 0.2 }
    )

    observer.observe(target.value)
    onUnmounted(() => observer.disconnect())
  })

  return { target, isVisible }
}
