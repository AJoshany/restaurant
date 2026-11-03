import { z } from 'zod'
import { ORDER_STATUSES } from '../domain/order-status'
import { LocalizedTextSchema } from './localized-text.schema'

export const OrderStatusSchema = z.enum(ORDER_STATUSES)

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: LocalizedTextSchema,
  unitPrice: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  subtotal: z.number().int().nonnegative()
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(1),
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().int().nonnegative(),
  status: OrderStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string()
})

export const CreateOrderItemRequestSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive()
})

export const CreateOrderRequestSchema = z.object({
  items: z.array(CreateOrderItemRequestSchema).min(1)
})

export const UpdateOrderStatusRequestSchema = z.object({
  status: OrderStatusSchema
})

export type OrderItem = z.infer<typeof OrderItemSchema>
export type Order = z.infer<typeof OrderSchema>
export type CreateOrderItemRequest = z.infer<typeof CreateOrderItemRequestSchema>
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>
