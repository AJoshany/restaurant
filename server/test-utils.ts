import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach } from 'vitest'

/**
 * Narrows a possibly-undefined array element for test fixtures, instead of
 * reaching for a non-null assertion.
 */
export function must<T>(value: T | undefined, message = 'Expected value to be defined'): T {
  if (value === undefined) {
    throw new Error(message)
  }
  return value
}

/**
 * Points DATA_FILE_PATH at a fresh temp file for each test and restores the
 * previous value afterward, so tests never touch the real .data/data.json
 * and never leak state between tests. Shared by service- and API-level
 * tests that exercise storage.ts through readData/writeData.
 */
export function useTempDataFile(): void {
  let tempDir: string
  const originalDataFilePath = process.env.DATA_FILE_PATH

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'restaurant-test-'))
    process.env.DATA_FILE_PATH = join(tempDir, 'data.json')
  })

  afterEach(async () => {
    process.env.DATA_FILE_PATH = originalDataFilePath
    await rm(tempDir, { recursive: true, force: true })
  })
}
