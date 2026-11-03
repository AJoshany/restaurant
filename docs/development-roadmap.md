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
5. **Internationalization and design system** — real translation copy for
   all planned screens; expand the Tailwind `@theme` tokens as real UI
   needs (beyond the current placeholder palette) emerge; first shared
   `app/components/ui/` primitives.
6. **Restaurant landing page** (`/`) — real marketing/informational content
   replacing the current placeholder.
7. **Customer kiosk and shopping cart** (`/kiosk`) — menu browsing, cart,
   checkout flow. This is the most likely point where cross-component cart
   state justifies introducing Pinia (see `docs/architecture.md`'s state
   management section) — revisit that decision here, don't pre-install it.
8. **Staff management panel** (`/staff`) — order queue, status updates;
   first use of `app/middleware/` for auth, and `server/middleware/` for
   API-side auth checks.
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
