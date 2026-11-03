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
