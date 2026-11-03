import '../api-test-setup'
import { beforeAll, describe, expect, it } from 'vitest'
import type { WebHandler } from 'h3'
import type { ApiSuccess } from '#shared/types/api'
import type { Product } from '#shared/schemas/product.schema'
import { useTempDataFile } from '../test-utils'
import { writeData } from '../utils/storage'
import { createTestFetch } from '../api-test-app'

useTempDataFile()

let fetchHandler: WebHandler

beforeAll(async () => {
  fetchHandler = await createTestFetch()
})

describe('GET /api/products', () => {
  it('returns the full product catalog by default', async () => {
    const response = await fetchHandler(new Request('http://localhost/api/products'))
    expect(response.status).toBe(200)

    const body = (await response.json()) as ApiSuccess<Product[]>
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(5)
  })

  it('filters to active products only when activeOnly=true', async () => {
    await writeData((current) => ({
      ...current,
      products: current.products.map((product, index) =>
        index === 0 ? { ...product, isActive: false } : product
      )
    }))

    const response = await fetchHandler(
      new Request('http://localhost/api/products?activeOnly=true')
    )
    const body = (await response.json()) as ApiSuccess<Product[]>

    expect(body.data).toHaveLength(4)
    expect(body.data.every((product) => product.isActive)).toBe(true)
  })
})
