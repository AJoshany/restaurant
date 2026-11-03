import { createError } from 'h3'
import type { Product } from '#shared/schemas/product.schema'
import { readData } from '../utils/storage'

export interface GetProductsOptions {
  activeOnly?: boolean
}

export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  const { products } = await readData()
  return options.activeOnly ? products.filter((product) => product.isActive) : products
}

export async function getProductById(id: string): Promise<Product> {
  const { products } = await readData()
  const product = products.find((candidate) => candidate.id === id)

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: `Product ${id} not found` })
  }

  return product
}
