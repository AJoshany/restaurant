import { z } from 'zod'

/**
 * Root shape of the shared data.json store. Future phases add entity
 * collections (products, orders, etc.) as additional top-level keys here.
 */
export const DataFileSchema = z.object({
  version: z.number().int().positive(),
  initializedAt: z.string()
})

export type DataFile = z.infer<typeof DataFileSchema>

export function createDefaultDataFile(): DataFile {
  return {
    version: 1,
    initializedAt: new Date().toISOString()
  }
}
