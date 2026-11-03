import { createError, defineEventHandler, getQuery, getRouterParam, readBody } from 'h3'
import { vi } from 'vitest'
import { success } from './utils/response'

/**
 * server/api/* handlers rely on Nitro auto-importing these as globals (see
 * "Deliberate exception to 'prefer auto-imports'" in docs/architecture.md) -
 * a build-time transform that doesn't run under plain Vitest. Stubbing them
 * here lets the actual handler modules be imported and exercised as-is in
 * integration tests, instead of duplicating their logic in test doubles.
 * Must be imported before any server/api/* handler module.
 *
 * Deliberately kept outside server/api/ - Nitro's route scanner treats every
 * file under that folder as a potential route handler (see
 * docs/architecture.md), and a test helper living there would otherwise be
 * built into the production server as a live (broken) route.
 */
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('getQuery', getQuery)
vi.stubGlobal('getRouterParam', getRouterParam)
vi.stubGlobal('readBody', readBody)
vi.stubGlobal('createError', createError)
vi.stubGlobal('success', success)
