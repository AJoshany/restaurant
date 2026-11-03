# Development Roadmap

Suggested implementation order for everything beyond the foundation set up
in this phase. Each phase assumes the previous ones are done. None of these
phases are implemented yet — this document exists to sequence future work,
not to describe current state (see `docs/architecture.md` for that).

1. **Project foundation and tooling** — _done._ Nuxt 4 + TypeScript strict +
   ESLint/Prettier + Tailwind v4 + `@nuxtjs/i18n` + the JSON storage utility
   skeleton, as described in `docs/architecture.md`.
2. **Shared types, schemas, and data models** — _done._ `Product`, `Order`,
   `OrderItem`, `OrderStatus`, and the create-order/update-status request
   shapes are implemented as Zod schemas in `shared/schemas/`, with the
   status-transition policy and pricing math in `shared/domain/` (see
   "Server-side layering" in `docs/architecture.md` and
   `docs/data-model.md`). `DataFileSchema` is extended with `products`,
   `orders`, and `orderSequence`. Only product/order exist so far — menu
   categories, tables, and staff roles are not modeled yet and should follow
   the same pattern when a real need for them appears.
3. **Server-side JSON storage infrastructure** — _done._ `server/services/`
   has `product.service.ts`/`order.service.ts` on top of `readData`/
   `writeData`, `server/utils/storage.ts` stays generic (now also handles
   corrupted-file detection explicitly). The documented API endpoints
   (`docs/api-reference.md`) are implemented with Zod request validation and
   the `success()`/`createError` convention, including the
   `GET /api/orders/updates` polling sync endpoint. Automated tests cover
   domain, schemas, storage, and services (`npm run test`) — see
   `docs/architecture.md` for the testing approach and its one deliberate
   deviation from auto-imports.
4. **Shared API communication layer** — _next._ Client-side composables
   (`app/composables/`) wrapping `useFetch`/`$fetch` for each resource
   (products, orders, the polling sync endpoint), with consistent
   loading/error/success handling, built on the `ApiResponse<T>` type. This
   is the first `app/` work in the project and the natural starting point
   for whoever picks this up next.
5. **Internationalization and design system** — _design system half done,
   ahead of phase 4._ Tokens (color/typography/spacing/radius) and the
   first shared `app/components/ui/` primitives (button, input/textarea,
   card, badge, spinner, empty state) are implemented — see
   `docs/design-system.md`. Still pending: real translation copy for each
   planned screen, which arrives with that screen's real UI (phases 6-9),
   and any further primitive (e.g. select) once a real page needs it
   twice.
6. **Restaurant landing page** (`/`) — _done._ Real marketing/informational
   content (`app/pages/index.vue` composing `app/components/landing/*`)
   replaces the placeholder: a hero with a kiosk CTA, restaurant story,
   feature highlights, a menu-preview gallery, and a closing CTA, all bilingual
   (`i18n/locales/*.json`'s `landing.*` namespace), responsive, and RTL/LTR
   aware. Scroll-driven image reveals use the new `useScrollReveal`
   composable (`app/composables/`). Imagery is custom SVG illustration (no
   real photography/menu content yet — see `docs/project-overview.md`'s
   "No real menu/catalog content yet" limitation, which still applies).
7. **Customer kiosk and shopping cart** (`/kiosk`) — _done._ Menu browsing
   (`KioskProductGrid`/`KioskProductCard`), a cart (`useCart`, backed by
   `useState`), and a checkout flow (`KioskCartPanel` + `useCreateOrder`
   against `POST /api/orders`) with loading/empty/error states and an order
   confirmation screen (`KioskOrderConfirmation`), all bilingual and
   responsive/RTL-LTR aware. The Pinia-vs-`useState` decision flagged below
   was revisited here: the cart is simple array state scoped to one page
   tree, so `useState` was kept and Pinia was not introduced — see "State
   management strategy" in `docs/architecture.md`.
8. **Staff management panel** (`/staff`) — _order queue and status updates
   done._ `app/pages/staff/index.vue` composes `app/components/staff/*`
   (`StaffStatusFilter`, `StaffOrderList`, `StaffOrderCard`) against
   `useOrders` (SSR-fetched initial load, then polled via the new
   `app/composables/usePolling.ts`) and `useUpdateOrderStatus`, with
   loading/empty/error states, status filtering/grouping, and bilingual/
   RTL-LTR/responsive layout — see `docs/architecture.md`. **Auth is still
   deferred**: `app/middleware/` and `server/middleware/` access control
   wasn't part of this delivered scope and remains a known limitation (see
   `docs/project-overview.md`), to be picked up as its own phase.
9. **Admin management panel** (`/admin`) — menu/catalog management, staff
   accounts, reporting.
10. **Cross-browser synchronization and final validation** — implement the
    polling mechanism documented in `docs/architecture.md` (target: updates
    visible across sessions within 5 seconds) across kiosk/staff/admin, plus
    full regression/responsive/RTL-LTR validation (see the
    `quality-assurance` skill) before considering the app feature-complete.

Each phase should go through the same workflow defined in `AGENTS.md`
(Analyze → Plan → Implement → Validate → Review → Report → Wait for
Approval) rather than being batched together.
