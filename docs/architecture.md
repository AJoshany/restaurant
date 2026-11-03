# Architecture

This document describes the Core & Data Layer of the restaurant ordering
platform: a Nuxt 4 app serving four areas — the public landing page (`/`),
the customer kiosk (`/kiosk`), the staff panel (`/staff`), and the admin
panel (`/admin`) — all reading and writing the same server-side JSON data
store. See `docs/project-overview.md` for the product-level picture,
`docs/data-model.md` for entity shapes, and `docs/api-reference.md` for
endpoint contracts — this document is about structure and mechanism, not
field-level or endpoint-level detail.

The product/order domain, persistence, services, and API are implemented.
No UI (pages/components/dashboards) is implemented yet beyond placeholders.
This document explains the structure that's in place and, just as
importantly, the structure that is **intentionally not created yet** and the
condition under which it should be added.

## Folder responsibilities

### `app/` — the Nuxt app layer (client + SSR)

| Folder                    | Purpose                                                                                                  | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/pages/`              | File-based routing. One subfolder per area (`kiosk/`, `staff/`, `admin/`), landing page at the root.     | Landing page (`/`), the kiosk (`/kiosk`, roadmap phase 7), the staff order queue (`/staff`, roadmap phase 8), and the admin order panel (`/admin`, roadmap phase 9) are real UI.                                                                                                                                                                                                                                                                                               |
| `app/layouts/`            | Shared page shells.                                                                                      | Only `default.vue` exists (a bare passthrough). Add `kiosk.vue`, `staff.vue`, `admin.vue` layouts when those areas need distinct chrome (e.g. staff/admin nav, kiosk fullscreen mode).                                                                                                                                                                                                                                                                                         |
| `app/components/ui/`      | Generic, presentation-only, reusable primitives (buttons, inputs, cards) with no business logic.         | In place: `BaseButton`, `BaseInput`, `BaseTextarea`, `BaseFormField`, `BaseCard`, `BaseBadge`, `BaseSpinner`, `BaseEmptyState` — see `docs/design-system.md`.                                                                                                                                                                                                                                                                                                                  |
| `app/components/landing/` | Section components for the public landing page (`/`) only — not reused by other areas.                   | In place: `LandingHeader`, `LandingHero`, `LandingStory`, `LandingHighlights`, `LandingGallery`, `LandingCta`, `LandingFooter`. Registered in `nuxt.config.ts` (`components.dirs`) with `pathPrefix: false`, same pattern as `ui/`.                                                                                                                                                                                                                                            |
| `app/components/kiosk/`   | Section components for the customer kiosk (`/kiosk`) only — not reused by other areas.                   | In place: `KioskProductGrid`, `KioskProductCard`, `KioskCartPanel`, `KioskCartItemRow`, `KioskOrderConfirmation`. Registered in `nuxt.config.ts` (`components.dirs`) with `pathPrefix: false`, same pattern as `landing/`.                                                                                                                                                                                                                                                     |
| `app/components/staff/`   | Section components for the staff order queue (`/staff`) only — not reused by other areas.                | In place: `StaffOrderCard`, `StaffOrderList` (roadmap phase 8). The status-filter tabs moved to `app/components/shared/` once admin needed the same UI (see below). Registered in `nuxt.config.ts` the same way as `kiosk/`.                                                                                                                                                                                                                                                   |
| `app/components/admin/`   | Section components for the admin order panel (`/admin`) only — not reused by other areas.                | In place: `AdminOrderCard` (full item/pricing/status/timestamp detail, read-only), `AdminOrderList` (roadmap phase 9). Registered in `nuxt.config.ts` the same way as `staff/`.                                                                                                                                                                                                                                                                                                |
| `app/components/shared/`  | Composed components specific to this app's domain but reused across **areas** (e.g. a currency display). | Created at roadmap phase 9, its first trigger: `OrderStatusTabs` (status-filter tabs with counts), generalized out of staff's original `StaffStatusFilter` once admin needed the identical UI — the "all" tab's label is caller-supplied (`allLabel` prop) so the component stays area-agnostic. Registered in `nuxt.config.ts` (`components.dirs`) with `pathPrefix: false`.                                                                                                  |
| `app/composables/`        | Shared reactive logic extracted out of components (e.g. `useCart`, `usePolling`).                        | `useScrollReveal` (landing); `useProducts`, `useCart`, `useCreateOrder` (kiosk, roadmap phase 7); `usePolling`, `useOrders`, `useUpdateOrderStatus` (staff, roadmap phase 8) — see `docs/api-reference.md` and "Cross-browser synchronization" below. `useOrders` is reused as-is by admin (roadmap phase 9).                                                                                                                                                                  |
| `app/middleware/`         | Route middleware, e.g. staff/admin auth guards.                                                          | Not created yet — added when `/staff` and `/admin` need access control.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `app/plugins/`            | Nuxt plugins (e.g. a sync/polling bootstrapper).                                                         | Not created yet.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `app/stores/`             | Pinia stores.                                                                                            | **Not created.** The kiosk cart (roadmap phase 7) was the anticipated trigger (see "State management strategy" below) but turned out simple enough for `useState`; Pinia stays deferred until a real need appears.                                                                                                                                                                                                                                                             |
| `app/types/`              | Types specific to the app layer only (not shared with the server).                                       | `cart.ts` (`CartItem` — the kiosk cart's display-only line-item shape); `order-filter.ts` (`OrderStatusFilter`, status-tab selection, shared by staff and admin); `order-sort.ts` (`OrderSortOption`, admin's sort control, roadmap phase 9) — none of these are a server entity, so none belongs in `shared/types/`.                                                                                                                                                          |
| `app/utils/`              | Pure client-side helper functions, auto-imported.                                                        | `currency.ts` (`formatCurrencyAmount`), `localized-text.ts` (`getLocalizedText`) — added for the kiosk; `datetime.ts`, `order-filter.ts`, `order-status-badge.ts`, `order-updates.ts` — added for staff (roadmap phase 8), reused across its composables/components and now also by admin; `order-sort.ts` (`sortOrders`, `ORDER_SORT_OPTIONS`) — added for admin's client-side sort control (roadmap phase 9), since `GET /api/orders/updates` has no server-side sort param. |
| `app/assets/css/`         | Global styles and the Tailwind entry point (`main.css`), which defines the design tokens via `@theme`.   | In place.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### `server/` — Nitro server layer

| Folder               | Purpose                                                                                                                    | Status                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `server/api/`        | HTTP endpoints (thin: parse/validate → call a `server/services/*` function → respond).                                     | `health.get.ts` (smoke test) plus the real `products`/`orders` endpoints — see `docs/api-reference.md`. |
| `server/services/`   | Application layer: business workflows on top of `storage.ts` (product lookups, order creation/pricing/status transitions). | `product.service.ts`, `order.service.ts`. See "Server-side layering" below.                             |
| `server/utils/`      | Server-only helpers, auto-imported in `server/`.                                                                           | `storage.ts` (JSON persistence) and `response.ts` (response shape helper).                              |
| `server/schemas/`    | Zod schemas for data that is validated **only** on the server (e.g. the root data-file shape, internal request payloads).  | `data.schema.ts` — `DataFileSchema` plus placeholder product seeding.                                   |
| `server/middleware/` | Cross-cutting server middleware (logging, auth checks on API routes).                                                      | Not created yet — add when `/staff`/`/admin` APIs need request-level auth checks.                       |

### `shared/` — code usable by both `app/` and `server/`

Nuxt 4's `shared/` directory is auto-aliased as `#shared/*` and is the only
place that should be imported from both the client/SSR app code and the
Nitro server code.

| Folder              | Purpose                                                                                                               | Status                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `shared/types/`     | Cross-cutting TypeScript types, e.g. `ApiResponse<T>`.                                                                | `api.ts` only.                                                                                                           |
| `shared/constants/` | Configuration values used in more than one layer (so they're never hardcoded twice), e.g. the supported-locale list.  | `i18n.ts` only.                                                                                                          |
| `shared/domain/`    | Domain layer: framework-free business rules (order status transitions, total/subtotal math, order numbering).         | `order-status.ts`, `order-total.ts`, `order-number.ts`. See "Server-side layering" below.                                |
| `shared/schemas/`   | Zod schemas for **entities** that both the client (form validation) and server (request validation) need to agree on. | `product.schema.ts`, `order.schema.ts`, `localized-text.schema.ts`, plus the create-order/update-status request schemas. |

## Server-side layering

The server is organized into four layers:

- **Domain** (`shared/domain/`) — pure business rules with no Nuxt/Vue/
  Nitro/H3/filesystem dependency: the order status transition policy
  (`order-status.ts`), total/subtotal calculation (`order-total.ts`), and
  order-number formatting (`order-number.ts`). Placed in `shared/` rather
  than `server/` because nothing here is server-specific — a future kiosk
  cart preview or staff status button can import the same functions.
- **Application** (`server/services/`) — one file per entity
  (`product.service.ts`, `order.service.ts`) containing all business
  orchestration: product existence/active checks, price snapshotting, total
  calculation (via the domain layer), status-transition enforcement, order
  numbering. Services call `readData`/`writeData` directly — there is no
  separate repository class on top of `storage.ts`, since `storage.ts` is
  already the generic infrastructure layer and another abstraction between
  it and a JSON-backed service would add nothing.
- **Infrastructure** (`server/utils/storage.ts`) — JSON file persistence.
  See "JSON persistence architecture" below for what it guards against.
- **API** (`server/api/`) — thin HTTP handlers: parse/validate input → call
  a service → `success(data)`, or let the service's `createError`
  propagate. No business logic lives here.

**Deliberate exception to "prefer auto-imports":** `server/api/*` continues
to rely on Nitro auto-importing `server/utils/*` (as `health.get.ts` always
has). `server/services/*`, however, **explicitly** imports
`readData`/`writeData` from `../utils/storage` and `createError` from `h3`.
Reason: Nitro's auto-import is a build-time transform that doesn't run under
plain Vitest, and the application-service layer has mandatory automated
tests (`server/services/*.test.ts`) that import these modules directly. This
exception is scoped to `server/services/` — don't extend it elsewhere
without the same justification.

**Error handling strategy:** services throw H3's `createError({statusCode,
statusMessage})` directly rather than a parallel custom error type — this is
the same convention `server/api/*` always used ("Nitro's default error
formatting is the single source of truth"), so there's only one error shape
in the codebase. `createError` builds a plain error value; it doesn't take
an `H3Event`, so this doesn't make services depend on HTTP request objects.
API handlers don't catch these errors — they propagate, and Nitro formats
them, stripping stack traces/file paths in production (verified against a
production build; see `docs/api-reference.md`).

### `docs/` and root

- `docs/architecture.md` — this file.
- `docs/project-overview.md` — the primary product-level reference (purpose, roles, lifecycle, limitations).
- `docs/data-model.md` — entity shapes, field constraints, JSON storage structure.
- `docs/api-reference.md` — endpoint contracts, request/response shapes, error format.
- `docs/coding-conventions.md` — naming, structure, and style rules.
- `docs/development-roadmap.md` — the suggested build order for everything not yet implemented.
- `AGENTS.md` — instructions for AI coding agents working in this repo.

## Frontend / backend boundary

- The `app/` layer never touches the filesystem or holds the source of truth for shared data. It talks to `server/api/*` over HTTP (via Nuxt's `$fetch`/`useFetch`) and renders what it gets back.
- The `server/` layer owns all access to `.data/data.json`. All reads/writes go through `server/utils/storage.ts` — no endpoint or other server file should call `fs` directly.
- Request/response validation happens in `server/`, using Zod schemas from `server/schemas/` (server-only shapes, e.g. the root data file) or `shared/schemas/` (shapes shared with client-side form validation, e.g. `Product`/`Order`/the request schemas).
- Business logic (order lifecycle, pricing, etc.) lives in `server/services/*` — handlers stay thin (parse input → call service → return response), and `storage.ts` stays a dumb, generic persistence utility with no business rules in it. See "Server-side layering" above.

## State management strategy

**Pinia is intentionally not installed.** Nothing in the current app needs
state shared across unrelated components or persisted across navigations —
`useState` (Nuxt's built-in SSR-friendly shared state) is sufficient for
simple cases like "which locale is active" or "is the mobile nav open."

Add Pinia only when a real need appears — the most likely trigger is the
kiosk shopping cart (roadmap phase 7), which needs non-trivial, mutated-from-
many-places state. Revisit this decision at that point rather than installing
it preemptively.

**Revisited at phase 7**: the kiosk cart (`app/composables/useCart.ts`) is a
single array of line items, mutated from a handful of components within one
page tree (`app/pages/kiosk/index.vue` and its `app/components/kiosk/*`
children) and never persisted beyond the session. `useState` already covers
this — no cross-page persistence, no complex derived state beyond the
item-count/subtotal computeds, which themselves delegate to the existing
`shared/domain/order-total.ts` math. Pinia remains deferred; reconsider only
if a future requirement needs the cart to survive outside this component
tree (e.g. persisted across a reload) or needs more than plain array
mutations.

## JSON persistence architecture

There is no database. All persistent application data lives in a single
`.data/data.json` file on the server (path overridable via the
`DATA_FILE_PATH` env var — see `.env.example`). `.data/` is already excluded
from git and from Prettier.

`server/utils/storage.ts` is the **only** module allowed to read or write
that file, and exposes two functions:

- `readData()` — returns the current contents, auto-creating the file with
  default content (`server/schemas/data.schema.ts#createDefaultDataFile`,
  which seeds five placeholder products — see `docs/data-model.md`) on
  first access.
- `writeData(mutate)` — reads the current contents, applies a pure
  `(current) => next` mutator, validates the result against
  `DataFileSchema`, and writes it back.

The file path is read lazily (`getDataFilePath()`, called on every
read/write) rather than cached at module load — this has no behavioral
effect in the app itself (`DATA_FILE_PATH` doesn't change at runtime), but
lets `server/utils/storage.test.ts` point each test at its own isolated
temp file via `process.env.DATA_FILE_PATH` without needing to reload the
module.

Three safety properties are built in, because they're foundational and hard
to retrofit later:

1. **Atomic writes.** Every write goes to a uniquely-named temp file in the
   same directory, then `fs.rename`s it into place. A crash mid-write can
   never leave `data.json` truncated or partially written.
2. **In-process write serialization.** A promise-chained queue inside
   `storage.ts` ensures that if two requests call `writeData` concurrently,
   their read-modify-write cycles run one after another, never interleaved.
   **Limitation:** this only protects a single Nitro process. If this app is
   ever deployed with multiple server instances/processes sharing the same
   file, this queue does not prevent cross-process races — that would need
   real file locking (e.g. `proper-lockfile`) or a different storage backend.
3. **Explicit corrupted-file handling.** If the file exists but fails to
   parse as JSON or fails `DataFileSchema` validation, `readData`/
   `writeData` throw a clean `createError({statusCode: 500, statusMessage:
'Data store is corrupted or unreadable'})` instead of letting a raw
   `SyntaxError`/`ZodError` (which can include the file path and internal
   field diagnostics) reach the client. **There is no auto-repair** —
   overwriting a corrupted file to "fix" it risks silently destroying real
   data, so this fails loudly and leaves it for a human to inspect. This is
   distinct from a missing file (`ENOENT`), which still auto-initializes as
   before.

Products and orders are top-level keys in `DataFileSchema`
(`server/schemas/data.schema.ts`), each with service-level helper functions
in `server/services/` built on top of `readData`/`writeData` — `storage.ts`
itself stays generic and has no product/order-specific logic in it. Future
entities follow the same pattern.

## Cross-browser synchronization

The kiosk, staff, and admin interfaces all read the same `data.json` through
the same API, and changes made in one browser session must become visible
in another within 5 seconds. The server side of this is implemented as
`GET /api/orders/updates` — a timestamp-cursor polling endpoint, not a
global revision counter: pass `?since=<ISO datetime>` and get back only
orders whose `updatedAt` is newer than that (covering both new orders and
status changes); omit it for the full current list (initial sync). Full
contract: `docs/api-reference.md`.

- **Client-side polling** via `useFetch`/`$fetch` on an interval is the
  client-side half of this, implemented starting with the staff panel
  (roadmap phase 8): `app/composables/usePolling.ts` is the generic
  `setInterval`-based composable anticipated here, and
  `app/composables/useOrders.ts` drives it against `GET /api/orders/updates`
  on a 3s interval — the initial load goes through `useFetch` (so it's
  SSR-rendered, like `useProducts`), and every tick after that merges
  changed orders by id via `app/utils/order-updates.ts#mergeOrderUpdates`.
  Admin (roadmap phase 9) reuses `useOrders()` directly, unchanged — it
  shares the same polling cursor/merge logic as staff, so an order placed
  on the kiosk or advanced by staff shows up on `/admin` within the same
  5-second target, with no second sync mechanism. See the recommended
  integration steps in
  `docs/api-reference.md#get-apiordersupdates---polling-sync-contract`.
- This is deliberately simple (no WebSockets/SSE) because the data volume
  and user counts for a single-restaurant ordering app don't justify the
  added complexity. If that changes, Nitro's SSE support is the natural next
  step without changing the persistence layer.
- The endpoint only covers orders (what kiosk/staff/admin need to stay in
  sync on). If product catalog changes ever need the same treatment (e.g.
  admin deactivating a product while a kiosk session is mid-browse), extend
  it the same way rather than building a second mechanism.

## Internationalization strategy

- `@nuxtjs/i18n` is configured with two locales, defined once in
  `shared/constants/i18n.ts` (`SUPPORTED_LOCALES`) and consumed by both
  `nuxt.config.ts` (module config) and the app (locale switcher UI) — so the
  locale list is never hardcoded twice.
  - `en-US` — English, LTR, default.
  - `fa-IR` — Persian, RTL.
- Translation files live in `i18n/locales/<code>.json`, loaded lazily by the
  module. Keys are namespaced (`app.*`, `nav.*`, `common.*`); extend this
  namespace structure as real UI copy is added — never hardcode user-facing
  text in components.
- `app/app.vue` sets `<html lang dir>` reactively from the active locale's
  `localeProperties`, so RTL/LTR switches globally whenever the locale
  changes — no per-component direction logic needed.
- Styling should prefer Tailwind's logical-property utilities (`ps-*`,
  `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`) over physical
  `left`/`right` utilities, so layouts flip correctly under `dir="rtl"`
  without extra overrides. See `docs/coding-conventions.md`.
