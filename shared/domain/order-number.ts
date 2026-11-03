/**
 * Human-readable order number derived from the persisted order sequence
 * counter (see server/schemas/data.schema.ts). Zero-padded for stable sort
 * order as a plain string.
 */
const ORDER_NUMBER_PREFIX = 'ORD-'
const ORDER_NUMBER_PADDING = 6

export function formatOrderNumber(sequence: number): string {
  return `${ORDER_NUMBER_PREFIX}${String(sequence).padStart(ORDER_NUMBER_PADDING, '0')}`
}
