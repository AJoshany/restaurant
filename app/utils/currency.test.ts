import { describe, expect, it } from 'vitest'
import { formatCurrencyAmount } from './currency'

describe('formatCurrencyAmount', () => {
  it('groups thousands per the en-US locale', () => {
    expect(formatCurrencyAmount(1250000, 'en-US')).toBe('1,250,000')
  })

  it('groups thousands per the fa-IR locale', () => {
    expect(formatCurrencyAmount(1250000, 'fa-IR')).toBe('۱٬۲۵۰٬۰۰۰')
  })

  it('formats zero', () => {
    expect(formatCurrencyAmount(0, 'en-US')).toBe('0')
  })
})
