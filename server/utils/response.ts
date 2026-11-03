import type { ApiSuccess } from '#shared/types/api'

/**
 * Wraps endpoint payloads in the shared ApiResponse success shape. For
 * failures, throw H3's `createError` directly from the handler - Nitro's
 * default error formatting already produces the matching ApiError shape.
 */
export function success<T>(data: T): ApiSuccess<T> {
  return { success: true, data }
}
