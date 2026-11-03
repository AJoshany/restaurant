import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { ProductSchema, type Product } from '#shared/schemas/product.schema'
import { OrderSchema } from '#shared/schemas/order.schema'

/**
 * Root shape of the shared data.json store. Entities (products, orders) are
 * top-level collections; `orderSequence` backs human-readable order numbers
 * (see shared/domain/order-number.ts). See docs/data-model.md for field
 * details and docs/architecture.md for the persistence mechanism.
 */
export const DataFileSchema = z.object({
  version: z.number().int().positive(),
  initializedAt: z.string(),
  products: z.array(ProductSchema),
  orders: z.array(OrderSchema),
  orderSequence: z.number().int().nonnegative()
})

export type DataFile = z.infer<typeof DataFileSchema>

/**
 * Five placeholder products seeded on first run. These are scaffold data, not
 * a real menu - see docs/data-model.md. Replace with real catalog content in
 * a later roadmap phase (landing page / admin catalog management).
 */
function createSeedProducts(): Product[] {
  const now = new Date().toISOString()

  return Array.from({ length: 5 }, (_, index) => {
    const position = index + 1
    return {
      id: randomUUID(),
      name: {
        'en-US': `Sample Product ${position}`,
        'fa-IR': `محصول نمونه ${position}`
      },
      image: `/images/products/placeholder-${position}.svg`,
      price: position * 50000,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  })
}

export function createDefaultDataFile(): DataFile {
  return {
    version: 1,
    initializedAt: new Date().toISOString(),
    products: createSeedProducts(),
    orders: [],
    orderSequence: 0
  }
}
