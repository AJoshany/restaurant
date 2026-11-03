import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * GSAP is registered once, client-side only: `ScrollTrigger` reads layout and
 * listens to scroll events, so registering it during SSR would fail. The
 * `.client.ts` suffix keeps this file out of the server bundle entirely.
 *
 * Animations themselves live in the landing components that own the elements
 * (each one cleans its own `gsap.matchMedia()` context up on unmount). This
 * plugin only performs the one-time global setup.
 */
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)

  // Mobile browsers fire resize when the URL bar collapses; that would make
  // ScrollTrigger re-measure and jump mid-scroll. The layout itself doesn't
  // change, so ignoring it keeps the scroll mapping stable.
  ScrollTrigger.config({ ignoreMobileResize: true })

  const refresh = () => ScrollTrigger.refresh()

  // Fonts and lazy images change element heights after hydration; re-measure
  // once both are in so start/end offsets match the final layout.
  void document.fonts?.ready.then(refresh)
  if (document.readyState === 'complete') {
    refresh()
  } else {
    window.addEventListener('load', refresh, { once: true })
  }
})
