/**
 * Pure pricing math shared by the order service and (later) kiosk cart
 * previews. Amounts are non-negative integers (smallest whole currency unit).
 */
export interface OrderTotalLineItem {
  unitPrice: number
  quantity: number
}

export function calculateItemSubtotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

export function calculateOrderTotal(items: readonly OrderTotalLineItem[]): number {
  return items.reduce(
    (total, item) => total + calculateItemSubtotal(item.unitPrice, item.quantity),
    0
  )
}
