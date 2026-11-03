import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { createDefaultDataFile, DataFileSchema, type DataFile } from '../schemas/data.schema'

/**
 * Read lazily (not a module-load-time constant) so tests can point
 * DATA_FILE_PATH at an isolated temp file per test without reloading the
 * module.
 */
function getDataFilePath(): string {
  return process.env.DATA_FILE_PATH ?? join(process.cwd(), '.data', 'data.json')
}

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
  const path = getDataFilePath()
  let raw: string
  try {
    raw = await readFile(path, 'utf-8')
  } catch (error: unknown) {
    if (isFileNotFoundError(error)) {
      const defaults = createDefaultDataFile()
      await atomicWriteFile(path, JSON.stringify(defaults, null, 2))
      return defaults
    }
    throw error
  }

  try {
    return DataFileSchema.parse(JSON.parse(raw))
  } catch {
    // Never leak parser/schema internals (which may include the file path or
    // field-level diagnostics) to API clients. No auto-repair: overwriting a
    // corrupted file risks silently destroying real data, so we fail loudly
    // and leave it for a human to inspect - see docs/architecture.md.
    throw createError({ statusCode: 500, statusMessage: 'Data store is corrupted or unreadable' })
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
    await atomicWriteFile(getDataFilePath(), JSON.stringify(next, null, 2))
    return next
  })
}
