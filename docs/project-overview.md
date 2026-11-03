# Project Overview

This is the primary reference for the restaurant ordering platform. Read
this first; it links out to the other docs for implementation detail rather
than duplicating it.

## Purpose and scope

A single-restaurant ordering platform with four areas sharing one
server-side data store (no database - see "Data persistence" below):

| Area    | Route    | Audience         | Purpose                                                         |
| ------- | -------- | ---------------- | --------------------------------------------------------------- |
| Landing | `/`      | Public           | Informational/marketing page about the restaurant.              |
| Kiosk   | `/kiosk` | Customers        | Browse the menu, build a cart, place an order.                  |
| Staff   | `/staff` | Restaurant staff | View incoming orders, advance their status.                     |
| Admin   | `/admin` | Administrators   | Manage the product catalog (and, over time, other admin tasks). |

The app is bilingual (Persian `fa-IR` RTL, English `en-US` LTR), fully
responsive, and keeps all four areas in sync with each other within 5
seconds of any data change, via polling (no WebSockets - see
`docs/architecture.md`).

## Technology stack

Nuxt 4 + Vue 3 (Composition API) + TypeScript (strict) + Tailwind CSS v4 +
`@nuxtjs/i18n` + Zod + a Nitro server API persisting to a single JSON file.
No Pinia yet (deliberately deferred, see `docs/architecture.md`), no
database. Full rationale for each choice: `docs/architecture.md`.

## User roles and responsibilities

- **Customer** (kiosk, unauthenticated): browses active products, places an
  order. Has no visibility into other customers' orders.
- **Staff** (`/staff`): sees all orders across all customers, advances an
  order through its lifecycle (see "Order lifecycle" below). Access
  control for this area is not implemented yet - `app/middleware/` and
  `server/middleware/` are reserved for it (see `docs/architecture.md`,
  roadmap phase 8).
- **Administrator** (`/admin`): manages the product catalog (create/edit/
  deactivate products). Access control likewise deferred to roadmap phase 9.

## Product management requirements

- A product has a localized name (English + Persian), an image reference, a
  price, and an active/inactive flag - see `docs/data-model.md#product` for
  the exact shape.
- Only **active** products can be ordered; inactive products are excluded
  from `GET /api/products?activeOnly=true` and rejected if referenced in a
  new order (`400`, see `docs/api-reference.md`).
- The app ships with **five placeholder products** as scaffold data (not a
  real menu - see `docs/data-model.md`). Real catalog content and
  admin-side catalog management (create/edit/deactivate via `/admin`) are
  later roadmap phases (`docs/development-roadmap.md`).
- Changing a product's price never retroactively changes past orders -
  every order item snapshots the product's name/price at order time (see
  "Order lifecycle" below and `docs/data-model.md`).

## Order lifecycle

An order is created from the kiosk with one or more items, then moves
through a strict, centralized, forward-only status sequence:

```
new -> preparing -> ready -> delivered
```

- **Created** (`new`): a customer places an order. The server - never the
  client - validates each referenced product, snapshots its current
  name/price, and computes the total. See `docs/data-model.md#pricing--totals`
  and `docs/api-reference.md#post-apiorders`.
- **Advanced** (`preparing` → `ready` → `delivered`): staff move the order
  forward one step at a time via `PATCH /api/orders/:id/status`. No
  skipping, no going back, no cancellation state exists yet. The policy is
  centralized in `shared/domain/order-status.ts` so it's enforced
  identically everywhere (currently: the API layer; later: any client UI
  that also wants to disable invalid buttons).
- Full field-level detail: `docs/data-model.md`. Full endpoint contracts:
  `docs/api-reference.md`.

## Data persistence requirements

No database. All products and orders live in a single
`.data/data.json` file, read/written exclusively through
`server/utils/storage.ts`, with atomic writes and in-process write
serialization. Full mechanism, limitations (single-process only), and the
corrupted-file-handling behavior: `docs/architecture.md`.

## Internationalization requirements

Two locales - `en-US` (default, LTR) and `fa-IR` (RTL) - defined once in
`shared/constants/i18n.ts`. UI chrome strings live in
`i18n/locales/*.json`; entity data that needs both languages (e.g. a
product's name) is stored as a `LocalizedText` object on the entity itself
(see `docs/data-model.md`). Full strategy: `docs/architecture.md`.

## Responsive and accessibility requirements

All four areas must work across standard responsive breakpoints
(`sm`/`md`/`lg`/`xl`/`2xl`) and under both `dir="ltr"` and `dir="rtl"`. Use
Tailwind logical-property utilities (`ps-*`, `pe-*`, `text-start`, etc.)
rather than physical `left`/`right` ones so layouts flip correctly - see
`docs/coding-conventions.md`. Exercised by real UI starting with the landing
page (roadmap phase 6), the kiosk (roadmap phase 7), and the staff panel
(roadmap phase 8); `/admin` still only has a placeholder.

## Cross-browser synchronization requirements

Any change made in one browser session (an order placed on a kiosk, a
status update from staff) must become visible in every other open session
(another kiosk, staff, admin) within 5 seconds. Implemented as a polling
endpoint, `GET /api/orders/updates`, documented in full in
`docs/api-reference.md`; the client-side polling composable that consumes it
is a later roadmap phase.

## Explicit limitations and non-goals

- **No database** - a single JSON file is the entire data store. Documented
  concurrency limitation: the in-process write queue does not protect
  against multiple Nitro server instances/processes sharing the file (see
  `docs/architecture.md`).
- **No authentication/authorization yet** - `/staff` and `/admin` are not
  access-controlled. Planned for roadmap phases 8-9.
- **No payment processing** - out of scope entirely; this is an
  order-tracking workflow, not a checkout/payment system.
- **No order cancellation** - the status model has no `cancelled` state.
- **No WebSockets/SSE** - synchronization is polling-based by deliberate
  choice (see `docs/architecture.md`); revisit only if polling proves
  insufficient.
- **No real menu/catalog content yet** - the five seeded products are
  scaffold placeholders, not real data (see `docs/data-model.md`).
- **No admin UI yet** - `/` has real marketing UI (roadmap phase 6),
  `/kiosk` has a real ordering flow (roadmap phase 7), and `/staff` has a
  real order queue with status updates and cross-browser sync (roadmap
  phase 8); `/admin` still only has a placeholder page. See
  `docs/development-roadmap.md` for what's next.

## Where to go next

- **Architecture and layering**: `docs/architecture.md`.
- **Entity shapes and storage format**: `docs/data-model.md`.
- **Endpoint contracts**: `docs/api-reference.md`.
- **Coding conventions**: `docs/coding-conventions.md`.
- **Build order / what's done vs. next**: `docs/development-roadmap.md`.
