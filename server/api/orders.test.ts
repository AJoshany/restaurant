import '../api-test-setup'
import { beforeAll, describe, expect, it } from 'vitest'
import type { WebHandler } from 'h3'
import type { ApiSuccess } from '#shared/types/api'
import type { Order, OrderUpdates } from '#shared/schemas/order.schema'
import { must, useTempDataFile } from '../test-utils'
import { getProducts } from '../services/product.service'
import { writeData } from '../utils/storage'
import { createTestFetch } from '../api-test-app'

useTempDataFile()

let fetchHandler: WebHandler

beforeAll(async () => {
  fetchHandler = await createTestFetch()
})

function jsonRequest(url: string, method: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
}

async function createTestOrder(): Promise<Order> {
  const product = must((await getProducts())[0])
  const response = await fetchHandler(
    jsonRequest('/api/orders', 'POST', { items: [{ productId: product.id, quantity: 1 }] })
  )
  const body = (await response.json()) as ApiSuccess<Order>
  return body.data
}

describe('POST /api/orders', () => {
  it('creates an order with server-computed pricing and a 2xx response', async () => {
    const products = await getProducts()
    const productA = must(products[0])
    const productB = must(products[1])

    const response = await fetchHandler(
      jsonRequest('/api/orders', 'POST', {
        items: [
          { productId: productA.id, quantity: 2 },
          { productId: productB.id, quantity: 1 }
        ]
      })
    )
    expect(response.status).toBe(200)

    const body = (await response.json()) as ApiSuccess<Order>
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('new')
    expect(body.data.totalAmount).toBe(productA.price * 2 + productB.price)
  })

  it('ignores a client-sent price/total and recomputes it server-side', async () => {
    const product = must((await getProducts())[0])

    const response = await fetchHandler(
      jsonRequest('/api/orders', 'POST', {
        items: [{ productId: product.id, quantity: 1, unitPrice: 1, subtotal: 1 }],
        totalAmount: 1
      })
    )
    const body = (await response.json()) as ApiSuccess<Order>

    expect(body.data.totalAmount).toBe(product.price)
    expect(body.data.items[0]?.unitPrice).toBe(product.price)
  })

  it('rejects an empty items array with 400', async () => {
    const response = await fetchHandler(jsonRequest('/api/orders', 'POST', { items: [] }))
    expect(response.status).toBe(400)
  })

  it('rejects a non-UUID productId with 400', async () => {
    const response = await fetchHandler(
      jsonRequest('/api/orders', 'POST', { items: [{ productId: 'not-a-uuid', quantity: 1 }] })
    )
    expect(response.status).toBe(400)
  })

  it('rejects a non-positive quantity with 400', async () => {
    const product = must((await getProducts())[0])
    const response = await fetchHandler(
      jsonRequest('/api/orders', 'POST', { items: [{ productId: product.id, quantity: 0 }] })
    )
    expect(response.status).toBe(400)
  })

  it('returns 404 for a well-formed but unknown productId', async () => {
    const response = await fetchHandler(
      jsonRequest('/api/orders', 'POST', {
        items: [{ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }]
      })
    )
    expect(response.status).toBe(404)
  })

  it('returns 400 for an inactive product', async () => {
    const product = must((await getProducts())[0])
    await writeData((current) => ({
      ...current,
      products: current.products.map((p) => (p.id === product.id ? { ...p, isActive: false } : p))
    }))

    const response = await fetchHandler(
      jsonRequest('/api/orders', 'POST', { items: [{ productId: product.id, quantity: 1 }] })
    )
    expect(response.status).toBe(400)
  })
})

describe('GET /api/orders', () => {
  it('returns an empty list when no orders exist', async () => {
    const response = await fetchHandler(new Request('http://localhost/api/orders'))
    const body = (await response.json()) as ApiSuccess<Order[]>
    expect(body.data).toEqual([])
  })

  it('filters by status and rejects an invalid status with 400', async () => {
    const order = await createTestOrder()

    const matching = await fetchHandler(new Request('http://localhost/api/orders?status=new'))
    const matchingBody = (await matching.json()) as ApiSuccess<Order[]>
    expect(matchingBody.data.map((o) => o.id)).toEqual([order.id])

    const nonMatching = await fetchHandler(new Request('http://localhost/api/orders?status=ready'))
    const nonMatchingBody = (await nonMatching.json()) as ApiSuccess<Order[]>
    expect(nonMatchingBody.data).toEqual([])

    const invalid = await fetchHandler(new Request('http://localhost/api/orders?status=bogus'))
    expect(invalid.status).toBe(400)
  })
})

describe('GET /api/orders/:id', () => {
  it('returns the matching order', async () => {
    const order = await createTestOrder()
    const response = await fetchHandler(new Request(`http://localhost/api/orders/${order.id}`))
    const body = (await response.json()) as ApiSuccess<Order>
    expect(body.data.id).toBe(order.id)
  })

  it('returns 400 for a non-UUID id', async () => {
    const response = await fetchHandler(new Request('http://localhost/api/orders/not-a-uuid'))
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown UUID', async () => {
    const response = await fetchHandler(
      new Request('http://localhost/api/orders/00000000-0000-0000-0000-000000000000')
    )
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/orders/:id/status', () => {
  it('applies a valid forward transition', async () => {
    const order = await createTestOrder()
    const response = await fetchHandler(
      jsonRequest(`/api/orders/${order.id}/status`, 'PATCH', { status: 'preparing' })
    )
    expect(response.status).toBe(200)

    const body = (await response.json()) as ApiSuccess<Order>
    expect(body.data.status).toBe('preparing')
  })

  it('rejects skipping a status with 400', async () => {
    const order = await createTestOrder()
    const response = await fetchHandler(
      jsonRequest(`/api/orders/${order.id}/status`, 'PATCH', { status: 'delivered' })
    )
    expect(response.status).toBe(400)
  })

  it('rejects an unknown status value with 400', async () => {
    const order = await createTestOrder()
    const response = await fetchHandler(
      jsonRequest(`/api/orders/${order.id}/status`, 'PATCH', { status: 'cancelled' })
    )
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown order id', async () => {
    const response = await fetchHandler(
      jsonRequest('/api/orders/00000000-0000-0000-0000-000000000000/status', 'PATCH', {
        status: 'preparing'
      })
    )
    expect(response.status).toBe(404)
  })
})

describe('GET /api/orders/updates', () => {
  it('is not shadowed by the dynamic /api/orders/:id route', async () => {
    const response = await fetchHandler(new Request('http://localhost/api/orders/updates'))
    expect(response.status).toBe(200)
  })

  it('returns every order on initial sync (no since)', async () => {
    await createTestOrder()
    const response = await fetchHandler(new Request('http://localhost/api/orders/updates'))
    const body = (await response.json()) as ApiSuccess<OrderUpdates>

    expect(body.data.orders).toHaveLength(1)
    expect(typeof body.data.serverTime).toBe('string')
  })

  it('returns only orders updated after the given cursor', async () => {
    const order = await createTestOrder()
    const initial = await fetchHandler(new Request('http://localhost/api/orders/updates'))
    const cursor = ((await initial.json()) as ApiSuccess<OrderUpdates>).data.serverTime

    const noChanges = await fetchHandler(
      new Request(`http://localhost/api/orders/updates?since=${cursor}`)
    )
    const noChangesBody = (await noChanges.json()) as ApiSuccess<OrderUpdates>
    expect(noChangesBody.data.orders).toEqual([])

    await new Promise((resolve) => setTimeout(resolve, 5))
    await fetchHandler(
      jsonRequest(`/api/orders/${order.id}/status`, 'PATCH', { status: 'preparing' })
    )

    const afterUpdate = await fetchHandler(
      new Request(`http://localhost/api/orders/updates?since=${cursor}`)
    )
    const afterUpdateBody = (await afterUpdate.json()) as ApiSuccess<OrderUpdates>
    expect(afterUpdateBody.data.orders.map((o) => o.id)).toEqual([order.id])
  })

  it('rejects a malformed since parameter with 400', async () => {
    const response = await fetchHandler(
      new Request('http://localhost/api/orders/updates?since=not-a-date')
    )
    expect(response.status).toBe(400)
  })
})

describe('Cross-session synchronization', () => {
  async function pollCursor(): Promise<string> {
    const response = await fetchHandler(new Request('http://localhost/api/orders/updates'))
    return ((await response.json()) as ApiSuccess<OrderUpdates>).data.serverTime
  }

  async function pollSince(since: string): Promise<Order[]> {
    const response = await fetchHandler(
      new Request(`http://localhost/api/orders/updates?since=${since}`)
    )
    return ((await response.json()) as ApiSuccess<OrderUpdates>).data.orders
  }

  it('makes an order created in one session visible to another session within one poll tick', async () => {
    // Two independent "browser sessions" (e.g. kiosk and staff), each with
    // their own polling cursor against the same shared server state.
    const kioskCursor = await pollCursor()
    const staffCursor = await pollCursor()

    await new Promise((resolve) => setTimeout(resolve, 5))
    const created = await createTestOrder()

    expect((await pollSince(kioskCursor)).map((o) => o.id)).toEqual([created.id])
    expect((await pollSince(staffCursor)).map((o) => o.id)).toEqual([created.id])
  })

  it('propagates a status change made in one session to every other session on the next poll', async () => {
    const order = await createTestOrder()
    const staffCursor = await pollCursor()
    const adminCursor = await pollCursor()

    await new Promise((resolve) => setTimeout(resolve, 5))
    await fetchHandler(
      jsonRequest(`/api/orders/${order.id}/status`, 'PATCH', { status: 'preparing' })
    )

    const [staffUpdates, adminUpdates] = await Promise.all([
      pollSince(staffCursor),
      pollSince(adminCursor)
    ])

    expect(staffUpdates).toHaveLength(1)
    expect(staffUpdates[0]?.status).toBe('preparing')
    expect(adminUpdates).toHaveLength(1)
    expect(adminUpdates[0]?.status).toBe('preparing')
  })
})

describe('Concurrent order creation', () => {
  it('never assigns the same id or order number to two concurrently created orders', async () => {
    // Regression guard for the storage write queue (server/utils/storage.ts)
    // actually serializing read-modify-write cycles - see docs/architecture.md
    // "In-process write serialization" - rather than letting concurrent
    // createOrder calls race on `orderSequence`.
    const product = must((await getProducts())[0])
    const concurrentOrders = 10

    const responses = await Promise.all(
      Array.from({ length: concurrentOrders }, () =>
        fetchHandler(
          jsonRequest('/api/orders', 'POST', { items: [{ productId: product.id, quantity: 1 }] })
        )
      )
    )

    expect(responses.every((response) => response.status === 200)).toBe(true)

    const orders = await Promise.all(
      responses.map(async (response) => ((await response.json()) as ApiSuccess<Order>).data)
    )

    expect(new Set(orders.map((order) => order.id)).size).toBe(concurrentOrders)
    expect(new Set(orders.map((order) => order.orderNumber)).size).toBe(concurrentOrders)
  })
})
