import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getProductById, getProducts } from './product.service'
import { must } from './test-utils'
import { writeData } from '../utils/storage'

let tempDir: string
const originalDataFilePath = process.env.DATA_FILE_PATH

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'restaurant-product-service-test-'))
  process.env.DATA_FILE_PATH = join(tempDir, 'data.json')
})

afterEach(async () => {
  process.env.DATA_FILE_PATH = originalDataFilePath
  await rm(tempDir, { recursive: true, force: true })
})

describe('getProducts', () => {
  it('returns every product by default', async () => {
    const products = await getProducts()
    expect(products).toHaveLength(5)
  })

  it('filters to only active products when activeOnly is set', async () => {
    await writeData((current) => ({
      ...current,
      products: current.products.map((product, index) =>
        index === 0 ? { ...product, isActive: false } : product
      )
    }))

    const activeProducts = await getProducts({ activeOnly: true })
    expect(activeProducts).toHaveLength(4)
    expect(activeProducts.every((product) => product.isActive)).toBe(true)
  })
})

describe('getProductById', () => {
  it('returns the matching product', async () => {
    const first = must((await getProducts())[0])
    const product = await getProductById(first.id)
    expect(product.id).toBe(first.id)
  })

  it('throws a 404 for an unknown id', async () => {
    await expect(getProductById('00000000-0000-0000-0000-000000000000')).rejects.toMatchObject({
      statusCode: 404
    })
  })
})
