# Development Roadmap

Suggested implementation order for everything beyond the foundation set up
in this phase. Each phase assumes the previous ones are done. None of these
phases are implemented yet — this document exists to sequence future work,
not to describe current state (see `docs/architecture.md` for that).

1. **Project foundation and tooling** — _done._ Nuxt 4 + TypeScript strict +
   ESLint/Prettier + Tailwind v4 + `@nuxtjs/i18n` + the JSON storage utility
   skeleton, as described in `docs/architecture.md`.
2. **Shared types, schemas, and data models** — design the real entities
   (menu items, categories, tables, orders, order items, staff roles, etc.)
   as Zod schemas in `shared/schemas/` (where both client forms and server
   endpoints need them) or `server/schemas/` (server-only shapes), with
   inferred TypeScript types. Extend `DataFileSchema` in
   `server/schemas/data.schema.ts` with these as new top-level collections.
3. **Server-side JSON storage infrastructure** — build repository-style
   helpers on top of `readData`/`writeData` for each entity (e.g.
   `getMenuItems`, `createOrder`), keeping `server/utils/storage.ts` itself
   generic. Add the first real `server/api/*` endpoints with proper
   request validation and the `success()`/`createError` response
   convention.
4. **Shared API communication layer** — client-side composables
   (`app/composables/`) wrapping `useFetch`/`$fetch` for each resource,
   with consistent loading/error/success handling, built on the
   `ApiResponse<T>` type.
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
