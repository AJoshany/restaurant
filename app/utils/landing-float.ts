import { gsap } from 'gsap'

export interface FloatTarget {
  element: HTMLElement
  /** Phase offset in radians, so neighbours don't bob in lockstep. */
  phase: number
  /** Multiplier on the shared amplitude (depth: nearer things move more). */
  weight: number
}

/**
 * Bobs airborne food on the GSAP ticker so it reads as suspended even when
 * the visitor stops scrolling. `strength` (0–1) is tweened by the scrubbed
 * timeline, so the bob fades in and out with scroll position — and in
 * reverse. Targets are inner wrappers the timeline never touches, so the two
 * never fight over the same transform.
 *
 * Returns a function that detaches the ticker (matchMedia can't revert it).
 */
export function startLandingFloat(
  targets: readonly FloatTarget[],
  strength: { value: number },
  { amplitudePx, tiltDeg }: { amplitudePx: number; tiltDeg: number }
): () => void {
  const setters = targets.map(({ element, phase, weight }) => ({
    y: gsap.quickSetter(element, 'y', 'px') as (value: number) => void,
    rotation: gsap.quickSetter(element, 'rotation', 'deg') as (value: number) => void,
    phase,
    weight
  }))
  const angularSpeed = (Math.PI * 2) / LANDING_FLOAT_PERIOD_S
  let settled = true

  const tick = (time: number) => {
    if (strength.value === 0) {
      if (settled) return
      settled = true
      for (const setter of setters) {
        setter.y(0)
        setter.rotation(0)
      }
      return
    }
    settled = false
    for (const { y, rotation, phase, weight } of setters) {
      const t = time * angularSpeed + phase
      y(Math.sin(t) * amplitudePx * weight * strength.value)
      rotation(Math.sin(t * 0.5) * tiltDeg * weight * strength.value)
    }
  }

  gsap.ticker.add(tick)
  return () => gsap.ticker.remove(tick)
}
