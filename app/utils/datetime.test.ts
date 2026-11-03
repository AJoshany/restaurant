import { describe, expect, it } from 'vitest'
import { formatDateTime } from './datetime'

describe('formatDateTime', () => {
  const iso = '2026-01-01T12:30:00.000Z'

  it('formats with en-US (Western) digits', () => {
    expect(formatDateTime(iso, 'en-US')).toMatch(/[0-9]/)
  })

  it('formats with fa-IR (Persian) digits', () => {
    expect(formatDateTime(iso, 'fa-IR')).toMatch(/[۰-۹]/)
  })

  it('produces different output per locale', () => {
    expect(formatDateTime(iso, 'en-US')).not.toBe(formatDateTime(iso, 'fa-IR'))
  })
})
