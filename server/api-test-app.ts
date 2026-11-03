import { createApp, createRouter, toWebHandler, type WebHandler } from 'h3'

/**
 * Mounts the real server/api/* handlers on their real routes (via h3,
 * Nitro's own underlying router) and exposes a fetch-like WebHandler, so
 * integration tests exercise actual HTTP request parsing/routing - including
 * the static-before-dynamic route resolution documented in
 * docs/api-reference.md#get-apiordersupdates---polling-sync-contract -
 * rather than calling handler functions directly.
 *
 * Handler modules are imported dynamically (after this function is called)
 * so `./api-test-setup`'s global stubs are guaranteed to be in place before
 * each handler's top-level `defineEventHandler(...)` call runs.
 *
 * Deliberately kept outside server/api/ - see the note in api-test-setup.ts.
 */
export async function createTestFetch(): Promise<WebHandler> {
  const [
    { default: productsGet },
    { default: ordersGet },
    { default: orderByIdGet },
    { default: ordersPost },
    { default: orderStatusPatch },
    { default: ordersUpdatesGet }
  ] = await Promise.all([
    import('./api/products.get'),
    import('./api/orders/index.get'),
    import('./api/orders/[id].get'),
    import('./api/orders/index.post'),
    import('./api/orders/[id]/status.patch'),
    import('./api/orders/updates.get')
  ])

  const app = createApp()
  const router = createRouter()

  // Static route registered before the dynamic `:id` segment, mirroring the
  // Nitro/radix3 resolution order documented in docs/api-reference.md.
  router.get('/api/orders/updates', ordersUpdatesGet)
  router.get('/api/orders/:id', orderByIdGet)
  router.get('/api/orders', ordersGet)
  router.post('/api/orders', ordersPost)
  router.patch('/api/orders/:id/status', orderStatusPatch)
  router.get('/api/products', productsGet)

  app.use(router)

  return toWebHandler(app)
}
