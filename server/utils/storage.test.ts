import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readData, writeData } from './storage'

let tempDir: string
let dataFilePath: string
const originalDataFilePath = process.env.DATA_FILE_PATH

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'restaurant-storage-test-'))
  dataFilePath = join(tempDir, 'data.json')
  process.env.DATA_FILE_PATH = dataFilePath
})

afterEach(async () => {
  process.env.DATA_FILE_PATH = originalDataFilePath
  await rm(tempDir, { recursive: true, force: true })
  vi.resetModules()
})

describe('readData', () => {
  it('auto-initializes the data file on first access', async () => {
    const data = await readData()

    expect(data.version).toBe(1)
    expect(data.orders).toEqual([])
    expect(data.products).toHaveLength(5)
    expect(data.orderSequence).toBe(0)

    const onDisk = JSON.parse(await readFile(dataFilePath, 'utf-8'))
    expect(onDisk).toEqual(data)
  })

  it('throws a clean error for corrupted JSON instead of leaking internals', async () => {
    await mkdir(tempDir, { recursive: true })
    await writeFile(dataFilePath, '{ not valid json', 'utf-8')

    await expect(readData()).rejects.toMatchObject({ statusCode: 500 })

    try {
      await readData()
      expect.unreachable()
    } catch (error) {
      const message = String((error as { statusMessage?: string }).statusMessage ?? '')
      expect(message).not.toContain(tempDir)
      expect(message).not.toContain('SyntaxError')
    }
  })
})

describe('writeData', () => {
  it('persists mutations and reflects them on the next read', async () => {
    await writeData((current) => ({ ...current, orderSequence: 42 }))
    const data = await readData()
    expect(data.orderSequence).toBe(42)
  })

  it('survives being read again after a fresh module load (process restart)', async () => {
    await writeData((current) => ({ ...current, orderSequence: 7 }))

    vi.resetModules()
    const reloaded = await import('./storage')
    const data = await reloaded.readData()

    expect(data.orderSequence).toBe(7)
  })

  it('serializes concurrent writes so no update is lost', async () => {
    await writeData((current) => current)

    const concurrentWrites = 20
    await Promise.all(
      Array.from({ length: concurrentWrites }, () =>
        writeData((current) => ({ ...current, orderSequence: current.orderSequence + 1 }))
      )
    )

    const data = await readData()
    expect(data.orderSequence).toBe(concurrentWrites)
  })

  it('never leaves a partially written file or stray temp files', async () => {
    for (let i = 0; i < 10; i += 1) {
      await writeData((current) => ({ ...current, orderSequence: current.orderSequence + 1 }))
    }

    const raw = await readFile(dataFilePath, 'utf-8')
    expect(() => JSON.parse(raw)).not.toThrow()

    const entries = await readdir(tempDir)
    const leftoverTempFiles = entries.filter((name) => name.endsWith('.tmp'))
    expect(leftoverTempFiles).toEqual([])
  })

  it('propagates a mutator error without writing anything', async () => {
    await writeData((current) => current)
    const before = await readFile(dataFilePath, 'utf-8')

    await expect(
      writeData(() => {
        throw new Error(`boom-${randomUUID()}`)
      })
    ).rejects.toThrow(/boom-/)

    const after = await readFile(dataFilePath, 'utf-8')
    expect(after).toBe(before)
  })
})
