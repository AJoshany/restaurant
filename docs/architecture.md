# Architecture

This document describes the foundation laid down for the restaurant ordering
platform: a Nuxt 4 app that will eventually serve four areas — the public
landing page (`/`), the customer kiosk (`/kiosk`), the staff panel
(`/staff`), and the admin panel (`/admin`) — all reading and writing the same
server-side JSON data store.

No business features are implemented yet. This document explains the
structure that's in place and, just as importantly, the structure that is
**intentionally not created yet** and the condition under which it should be
added.

## Folder responsibilities

### `app/` — the Nuxt app layer (client + SSR)

| Folder                   | Purpose                                                                                                | Status                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/pages/`             | File-based routing. One subfolder per area (`kiosk/`, `staff/`, `admin/`), landing page at the root.   | Placeholder `index.vue` per area exists today, proving routing/i18n/layout wiring works. Real UI is built per roadmap phase.                                                           |
| `app/layouts/`           | Shared page shells.                                                                                    | Only `default.vue` exists (a bare passthrough). Add `kiosk.vue`, `staff.vue`, `admin.vue` layouts when those areas need distinct chrome (e.g. staff/admin nav, kiosk fullscreen mode). |
| `app/components/ui/`     | Generic, presentation-only, reusable primitives (buttons, inputs, cards) with no business logic.       | Not created yet — create it when the first reusable primitive is needed by more than one page.                                                                                         |
| `app/components/shared/` | Composed components specific to this app's domain but reused across areas (e.g. a currency display).   | Not created yet — same rule: create on second real use.                                                                                                                                |
| `app/composables/`       | Shared reactive logic extracted out of components (e.g. `useCart`, `usePolling`).                      | Not created yet — first composable arrives with the kiosk cart (roadmap phase 7) or the sync mechanism (phase 10).                                                                     |
| `app/middleware/`        | Route middleware, e.g. staff/admin auth guards.                                                        | Not created yet — added when `/staff` and `/admin` need access control.                                                                                                                |
| `app/plugins/`           | Nuxt plugins (e.g. a sync/polling bootstrapper).                                                       | Not created yet.                                                                                                                                                                       |
| `app/stores/`            | Pinia stores.                                                                                          | **Not created.** See "State management strategy" below — Pinia is deliberately deferred.                                                                                               |
| `app/types/`             | Types specific to the app layer only (not shared with the server).                                     | Not created yet — app-only types will live here once they exist; cross-cutting types go in `shared/types/`.                                                                            |
| `app/utils/`             | Pure client-side helper functions, auto-imported.                                                      | Not created yet.                                                                                                                                                                       |
| `app/assets/css/`        | Global styles and the Tailwind entry point (`main.css`), which defines the design tokens via `@theme`. | In place.                                                                                                                                                                              |

### `server/` — Nitro server layer

| Folder               | Purpose                                                                                                                   | Status                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/api/`        | HTTP endpoints.                                                                                                           | `health.get.ts` only — an infrastructure smoke-test endpoint that exercises the storage utility. Product/order endpoints are added starting roadmap phase 2-3. |
| `server/utils/`      | Server-only helpers, auto-imported in `server/`.                                                                          | `storage.ts` (JSON persistence) and `response.ts` (response shape helper).                                                                                     |
| `server/schemas/`    | Zod schemas for data that is validated **only** on the server (e.g. the root data-file shape, internal request payloads). | `data.schema.ts` only, for now.                                                                                                                                |
| `server/middleware/` | Cross-cutting server middleware (logging, auth checks on API routes).                                                     | Not created yet — add when `/staff`/`/admin` APIs need request-level auth checks.                                                                              |

### `shared/` — code usable by both `app/` and `server/`

Nuxt 4's `shared/` directory is auto-aliased as `#shared/*` and is the only
place that should be imported from both the client/SSR app code and the
Nitro server code.

| Folder              | Purpose                                                                                                               | Status                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `shared/types/`     | Cross-cutting TypeScript types, e.g. `ApiResponse<T>`.                                                                | `api.ts` only.                                                                                                                   |
| `shared/constants/` | Configuration values used in more than one layer (so they're never hardcoded twice), e.g. the supported-locale list.  | `i18n.ts` only.                                                                                                                  |
| `shared/schemas/`   | Zod schemas for **entities** that both the client (form validation) and server (request validation) need to agree on. | Not created yet — there are no entities (products, orders, etc.) yet. Created in roadmap phase 2 alongside the first data model. |

### `docs/` and root

- `docs/architecture.md` — this file.
- `docs/coding-conventions.md` — naming, structure, and style rules.
- `docs/development-roadmap.md` — the suggested build order for everything not yet implemented.
- `AGENTS.md` — instructions for AI coding agents working in this repo.

## Frontend / backend boundary

- The `app/` layer never touches the filesystem or holds the source of truth for shared data. It talks to `server/api/*` over HTTP (via Nuxt's `$fetch`/`useFetch`) and renders what it gets back.
- The `server/` layer owns all access to `.data/data.json`. All reads/writes go through `server/utils/storage.ts` — no endpoint or other server file should call `fs` directly.
- Request/response validation happens in `server/`, using Zod schemas from `server/schemas/` (server-only shapes) or `shared/schemas/` (shapes shared with client-side form validation, once they exist).
- Business logic (order lifecycle, pricing, etc., once implemented) belongs in server-side service functions that sit between API handlers and `storage.ts` — handlers stay thin (parse input → call service → return response), and `storage.ts` stays a dumb, generic persistence utility with no business rules in it.

## State management strategy

**Pinia is intentionally not installed.** Nothing in the current app needs
state shared across unrelated components or persisted across navigations —
`useState` (Nuxt's built-in SSR-friendly shared state) is sufficient for
simple cases like "which locale is active" or "is the mobile nav open."

Add Pinia only when a real need appears — the most likely trigger is the
kiosk shopping cart (roadmap phase 7), which needs non-trivial, mutated-from-
many-places state. Revisit this decision at that point rather than installing
it preemptively.

## JSON persistence architecture

There is no database. All persistent application data lives in a single
`.data/data.json` file on the server (path overridable via the
`DATA_FILE_PATH` env var — see `.env.example`). `.data/` is already excluded
from git and from Prettier.

`server/utils/storage.ts` is the **only** module allowed to read or write
that file, and exposes two functions:

- `readData()` — returns the current contents, auto-creating the file with
  default content (`server/schemas/data.schema.ts#createDefaultDataFile`) on
  first access.
- `writeData(mutate)` — reads the current contents, applies a pure
  `(current) => next` mutator, validates the result against
  `DataFileSchema`, and writes it back.

Two safety properties are built in now, because they're foundational and
hard to retrofit later:

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

As real entities (products, orders, tables, etc.) are introduced, they become
additional top-level keys in `DataFileSchema`/the default data file, and get
their own repository-style helper functions built on top of `readData`/
`writeData` — `storage.ts` itself should stay generic.

## Cross-browser synchronization (documented, not implemented)

The kiosk, staff, and admin interfaces will all read the same `data.json`
through the same API, and changes made in one browser session must become
visible in another within 5 seconds. The recommended approach, to be
implemented alongside the first real data endpoints:

- **Client-side polling** via `useFetch`/`$fetch` on an interval (e.g. a
  future `usePolling` composable wrapping `setInterval` + refetch, with the
  interval tuned comfortably under 5s, e.g. 2-3s) on the staff/admin/kiosk
  screens that display shared state.
- This is deliberately simple (no WebSockets/SSE) because the data volume
  and user counts for a single-restaurant ordering app don't justify the
  added complexity. If that changes, Nitro's SSE support is the natural next
  step without changing the persistence layer.
- Polling responses should be cheap: the server can include a
  `lastUpdatedAt` timestamp in `data.json` so clients can skip re-rendering
  when nothing changed.

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
