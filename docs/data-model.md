# Data Model

This document describes the entities persisted in `.data/data.json` (see
`docs/architecture.md` for the persistence mechanism). Field shapes are
defined once as Zod schemas and never hand-duplicated:

- Entity and request schemas: `shared/schemas/` (`product.schema.ts`,
  `order.schema.ts`, `localized-text.schema.ts`).
- Business rules (status transitions, totals, order numbering):
  `shared/domain/` (`order-status.ts`, `order-total.ts`, `order-number.ts`).
- The root file shape: `server/schemas/data.schema.ts`.

All TypeScript types below are `z.infer<...>` of the corresponding schema -
if you need the type, import it from the schema file, don't redeclare it.

## LocalizedText

A piece of text with one value per supported locale
(`shared/constants/i18n.ts#SUPPORTED_LOCALES`), currently English and
Persian. Used for anything user-facing that's stored as data rather than UI
chrome (UI chrome strings go through `i18n/locales/*.json` instead).

```ts
{ 'en-US': string, 'fa-IR': string } // both required, min length 1
```

## Product

| Field       | Type                 | Notes                                                        |
| ----------- | -------------------- | ------------------------------------------------------------ |
| `id`        | `string` (UUID)      | Generated server-side.                                       |
| `name`      | `LocalizedText`      | Required in both locales.                                    |
| `image`     | `string`             | A path/reference, e.g. `/images/products/placeholder-1.svg`. |
| `price`     | `number` (int, >= 0) | Smallest whole currency unit (e.g. Toman) - never a float.   |
| `isActive`  | `boolean`            | Inactive products can't be ordered (see Order Items below).  |
| `createdAt` | `string` (ISO 8601)  |                                                              |
| `updatedAt` | `string` (ISO 8601)  |                                                              |

The app seeds **five placeholder products** on first run
(`server/schemas/data.schema.ts#createSeedProducts`) - `Sample Product 1..5`
with round placeholder prices and placeholder image paths. These are
scaffold data, not a real menu; a later roadmap phase (landing page content /
admin catalog management) replaces them with real catalog entries.

## Order

| Field         | Type                 | Notes                                                          |
| ------------- | -------------------- | -------------------------------------------------------------- |
| `id`          | `string` (UUID)      | Generated server-side.                                         |
| `orderNumber` | `string`             | Human-readable, e.g. `ORD-000001` - see Order Numbering below. |
| `items`       | `OrderItem[]`, min 1 | At least one item is required.                                 |
| `totalAmount` | `number` (int, >= 0) | Always server-calculated - see Pricing & Totals below.         |
| `status`      | `OrderStatus`        | See Order Status below.                                        |
| `createdAt`   | `string` (ISO 8601)  |                                                                |
| `updatedAt`   | `string` (ISO 8601)  | Bumped on every status change; used by the sync endpoint.      |

### OrderItem

| Field         | Type                 | Notes                                              |
| ------------- | -------------------- | -------------------------------------------------- |
| `productId`   | `string` (UUID)      | References the `Product` that was ordered.         |
| `productName` | `LocalizedText`      | **Snapshot** of the product's name at order time.  |
| `unitPrice`   | `number` (int, >= 0) | **Snapshot** of the product's price at order time. |
| `quantity`    | `number` (int, > 0)  |                                                    |
| `subtotal`    | `number` (int, >= 0) | `unitPrice * quantity`, server-calculated.         |

**Snapshot integrity**: `productName`/`unitPrice` are copied from the
`Product` at the moment the order is created and never change afterward,
even if the product's name/price/active state changes later. This is
enforced in `server/services/order.service.ts#createOrder`, which reads the
product and builds the snapshot inside the same `writeData` read-modify-write
cycle that persists the order (see "Concurrency" in
`docs/architecture.md`), so a concurrent price change can't race with order
creation.

### Order Status

Centralized in `shared/domain/order-status.ts`. Four states, forward-only,
no skipping:

```
new -> preparing -> ready -> delivered
```

`delivered` is terminal. There is no `cancelled` state and no backward
transition - any other transition (including a no-op) is rejected by
`isValidOrderStatusTransition()` and surfaces as `400 Bad Request` from
`PATCH /api/orders/:id/status` (see `docs/api-reference.md`).

Display labels are in `i18n/locales/{en-US,fa-IR}.json` under
`order.status.*` (UI chrome, not entity data).

### Order Numbering

`orderNumber` is derived from a persisted integer counter
(`DataFile.orderSequence`, starts at `0`) via
`shared/domain/order-number.ts#formatOrderNumber` - zero-padded to 6 digits
with an `ORD-` prefix (`ORD-000001`, `ORD-000002`, ...). The counter is
incremented inside the same `writeData` cycle that creates the order, so two
concurrent orders can never receive the same number (see "Concurrency and
Data Integrity" in `docs/architecture.md`).

## Pricing & Totals

- All monetary amounts (`Product.price`, `OrderItem.unitPrice`,
  `OrderItem.subtotal`, `Order.totalAmount`) are **non-negative integers** -
  no floats/decimals, per the smallest whole currency unit in use.
- `Order.totalAmount` is **always** computed server-side from current
  product prices at order-creation time
  (`shared/domain/order-total.ts#calculateOrderTotal`) - a client can never
  supply or influence it. The request schema
  (`CreateOrderRequestSchema`, see below) has no price/total field at all.

## Request Schemas

These validate API input (`shared/schemas/order.schema.ts`) and are also
reusable by future client-side forms (kiosk checkout, staff status buttons):

```ts
CreateOrderRequestSchema = {
  items: { productId: string (UUID), quantity: number (int, > 0) }[] // min 1
}

UpdateOrderStatusRequestSchema = {
  status: OrderStatus
}
```

## JSON Storage Structure (`.data/data.json`)

Validated on every read/write by `DataFileSchema`
(`server/schemas/data.schema.ts`):

```ts
{
  version: number,        // schema version, currently 1
  initializedAt: string,  // ISO 8601, set once on first run
  products: Product[],
  orders: Order[],
  orderSequence: number   // backs order numbering, see above
}
```

### Example

```json
{
  "version": 1,
  "initializedAt": "2026-01-01T00:00:00.000Z",
  "products": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": { "en-US": "Sample Product 1", "fa-IR": "محصول نمونه 1" },
      "image": "/images/products/placeholder-1.svg",
      "price": 50000,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "orders": [
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "orderNumber": "ORD-000001",
      "items": [
        {
          "productId": "11111111-1111-4111-8111-111111111111",
          "productName": { "en-US": "Sample Product 1", "fa-IR": "محصول نمونه 1" },
          "unitPrice": 50000,
          "quantity": 2,
          "subtotal": 100000
        }
      ],
      "totalAmount": 100000,
      "status": "preparing",
      "createdAt": "2026-01-01T00:05:00.000Z",
      "updatedAt": "2026-01-01T00:06:00.000Z"
    }
  ],
  "orderSequence": 1
}
```

See `docs/api-reference.md` for how these entities are exposed over HTTP.
