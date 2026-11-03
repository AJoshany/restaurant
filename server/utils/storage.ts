import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createDefaultDataFile, DataFileSchema, type DataFile } from '../schemas/data.schema'

const DATA_FILE_PATH = process.env.DATA_FILE_PATH ?? join(process.cwd(), '.data', 'data.json')

/**
 * Serializes writes within this process so concurrent requests can never
 * interleave a read-modify-write cycle. This does NOT protect against
 * multiple Nitro processes/instances writing the same file - a multi-instance
 * deployment would need real file locking or a different storage backend.
 */
let writeQueue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task)
  writeQueue = result.catch(() => undefined)
  return result
}

async function atomicWriteFile(path: string, contents: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const tempPath = `${path}.${randomUUID()}.tmp`
  await writeFile(tempPath, contents, 'utf-8')
  await rename(tempPath, path)
}

async function loadFromDisk(): Promise<DataFile> {
  try {
    const raw = await readFile(DATA_FILE_PATH, 'utf-8')
    return DataFileSchema.parse(JSON.parse(raw))
  } catch (error: unknown) {
    if (isFileNotFoundError(error)) {
      const defaults = createDefaultDataFile()
      await atomicWriteFile(DATA_FILE_PATH, JSON.stringify(defaults, null, 2))
      return defaults
    }
    throw error
  }
}

function isFileNotFoundError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}

export async function readData(): Promise<DataFile> {
  return enqueue(loadFromDisk)
}

export async function writeData(mutate: (current: DataFile) => DataFile): Promise<DataFile> {
  return enqueue(async () => {
    const current = await loadFromDisk()
    const next = DataFileSchema.parse(mutate(current))
    await atomicWriteFile(DATA_FILE_PATH, JSON.stringify(next, null, 2))
    return next
  })
}
