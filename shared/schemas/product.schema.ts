import { z } from 'zod'
import { LocalizedTextSchema } from './localized-text.schema'

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: LocalizedTextSchema,
  image: z.string().min(1),
  price: z.number().int().nonnegative(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Product = z.infer<typeof ProductSchema>
