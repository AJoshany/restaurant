# API Reference

All endpoints live under `server/api/`, are thin (parse/validate → call a
`server/services/*` function → respond), and follow the conventions in
`docs/coding-conventions.md`. See `docs/data-model.md` for entity shapes and
`docs/architecture.md` for the layering these handlers sit on top of.

## Response shapes

**Success** - `shared/types/api.ts#ApiSuccess<T>`, built via
`server/utils/response.ts#success()`:

```json
{ "success": true, "data": T }
```

**Error** - any non-2xx response. Thrown via H3's `createError` and
formatted by Nitro's default error handler:

```json
{
  "statusCode": 404,
  "statusMessage": "Order 123 not found"
}
```

In production, Nitro omits stack traces and file paths from this payload
(verified manually against a production build; dev mode includes a `stack`
field for local debugging only - never rely on it). No endpoint hand-rolls a
different error shape.

## `GET /api/products`

Returns the product catalog.

**Query params**

| Param        | Type      | Default | Notes                             |
| ------------ | --------- | ------- | --------------------------------- |
| `activeOnly` | `boolean` | `false` | Pass `activeOnly=true` to filter. |

**Response**: `ApiSuccess<Product[]>`.

## `GET /api/orders`

Returns orders, for the staff/admin panels.

**Query params**

| Param    | Type              | Default | Notes                                           |
| -------- | ----------------- | ------- | ----------------------------------------------- |
| `status` | `OrderStatus`     | -       | Filter to one status. Invalid value → `400`.    |
| `sort`   | `'asc' \| 'desc'` | `desc`  | Sorts by `createdAt`. Any other value → `desc`. |

**Response**: `ApiSuccess<Order[]>`.

## `GET /api/orders/:id`

Returns a single order.

- `:id` must be a UUID, otherwise `400 Invalid order id`.
- Unknown id → `404 Order <id> not found`.

**Response**: `ApiSuccess<Order>`.

## `POST /api/orders`

Creates a new order.

**Request body** (`CreateOrderRequestSchema`, see `docs/data-model.md`):

```json
{ "items": [{ "productId": "<uuid>", "quantity": 2 }] }
```

**Server behavior** (see `server/services/order.service.ts#createOrder`):

1. Validates the body shape (`400` if malformed, empty `items`, non-UUID
   `productId`, or non-positive-integer `quantity`).
2. For each item, looks up the product by id in the current data file:
   - Missing product → `404 Product <id> not found`.
   - Inactive product → `400 Product <id> is not available`.
3. Snapshots the product's current name/price into the order item and
   computes `subtotal`/`totalAmount` server-side -
   **client-sent price/total fields don't exist in the schema and are
   ignored even if present**.
4. Generates `id` (UUID) and `orderNumber` (from the persisted
   `orderSequence` counter) and sets `status: "new"`.
5. Persists the order. Steps 2-4 run inside the same storage write cycle as
   the persistence itself, so a concurrent product price/active change can't
   race with order creation (see `docs/architecture.md`).

**Response**: `ApiSuccess<Order>`, `201`-equivalent data (status code is
whatever `defineEventHandler` defaults to, `200`, since Nitro doesn't require
an explicit code here - no endpoint in this layer currently sets one beyond
the default).

## `PATCH /api/orders/:id/status`

Updates an order's status.

**Request body** (`UpdateOrderStatusRequestSchema`): `{ "status": "preparing" }`.

**Server behavior**:

- `:id` must be a UUID → otherwise `400 Invalid order id`.
- Unknown order → `404 Order <id> not found`.
- `status` must be one of `new | preparing | ready | delivered` → otherwise
  `400 Invalid status payload`.
- The transition must be valid per the centralized policy
  (`shared/domain/order-status.ts`) - forward-only, no skipping, `delivered`
  is terminal. An invalid transition (including a no-op) →
  `400 Cannot transition order from "<from>" to "<to>"`.

**Response**: `ApiSuccess<Order>` with the updated `status` and `updatedAt`.

## `GET /api/orders/updates` - polling sync contract

Lightweight polling endpoint for cross-browser sync between kiosk/staff/admin
(see "Cross-browser synchronization" in `docs/architecture.md`). This is a
**static route** and is resolved ahead of the dynamic `orders/:id` segment by
Nitro/radix3, so it is never shadowed by it.

**Query params**

| Param   | Type                | Notes                                                     |
| ------- | ------------------- | --------------------------------------------------------- |
| `since` | `string` (ISO 8601) | Optional. Invalid format → `400 Invalid since parameter`. |

**Behavior**:

- **Omit `since`** (initial sync): returns every order currently in the
  store.
- **Pass `since`**: returns only orders whose `updatedAt` is strictly after
  `since` (covers both newly created orders and status changes, since both
  set `updatedAt`).

**Response**:

```json
{
  "success": true,
  "data": {
    "orders": [/* Order[] */],
    "serverTime": "2026-01-01T00:00:05.123Z"
  }
}
```

**Recommended client integration** (to be implemented in a later roadmap
phase as an `app/composables/usePolling.ts`-style composable, not part of
this phase):

1. On mount, call with no `since` to get the full current list and store
   `serverTime` as `cursor`.
2. Every 2-3 seconds (comfortably under the 5-second sync requirement), call
   again with `since=<cursor>`, merge any returned orders into local state by
   `id` (replace, since an order's `updatedAt` only moves forward), and
   update `cursor` to the new `serverTime`.
3. On a polling request failure, keep the previous `cursor` and retry on the
   next tick rather than advancing it - a failed request must not silently
   skip updates.
