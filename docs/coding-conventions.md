# Coding Conventions

These conventions apply to all code in this repo, including future
feature work in `/kiosk`, `/staff`, and `/admin`. See `docs/architecture.md`
for _where_ things live; this document is about _how_ to write them.

## Naming conventions

- **Components**: `PascalCase.vue` (e.g. `OrderCard.vue`). Multi-word names
  required (avoid single-word components that could collide with native
  elements).
- **Composables**: `useX.ts`, camelCase after `use` (e.g. `usePolling.ts`).
- **Server utils/schemas**: camelCase filenames (`storage.ts`,
  `data.schema.ts`); one schema/concept per file.
- **Types/interfaces**: `PascalCase`, no `I` prefix (`ApiResponse`, not
  `IApiResponse`).
- **Constants**: `UPPER_SNAKE_CASE` for primitive constants
  (`DEFAULT_LOCALE`); `camelCase` for constant objects/arrays unless they're
  genuinely enum-like (`SUPPORTED_LOCALES` is the accepted exception —
  treat it as an enum of config objects).
- **Files in `pages/`**: lowercase, matching the route (`kiosk/index.vue`).

## Component structure

- `<script setup lang="ts">` first, `<template>` second. No `<style>` blocks
  unless a one-off tweak genuinely can't be a Tailwind utility — prefer
  utilities over custom CSS.
- Components stay focused on presentation. If a component needs more than
  trivial local state or any data fetching/mutation logic, extract that
  logic into a composable and have the component call it.
- Split a component the moment it takes on two responsibilities (e.g.
  "renders an order row" and "handles order status transitions") — don't
  wait for a third.
- Props/emits: always typed (`defineProps<{...}>()`, `defineEmits<{...}>()`),
  never the runtime declaration style.

## Composable conventions

- A composable is for **shared reactive logic**, not a dumping ground for
  any function. If a piece of logic is used in exactly one component and
  isn't reactive, it's a plain function in `utils/`, not a composable.
- Composables return plain objects of refs/computed/functions — avoid
  returning reactive objects that hide what's mutable.
- Server-only logic never lives in a composable under `app/composables/` —
  that code runs client + SSR. Server-only logic belongs in
  `server/utils/`.

## TypeScript conventions

- Strict mode is on (`typescript.strict: true` in `nuxt.config.ts`) and
  must stay on. `npm run typecheck` must pass before any change is
  considered done.
- Avoid `any`. If a type genuinely can't be known, use `unknown` and narrow
  it, or write the precise type.
- Shared data shapes (API payloads, entities) get an explicit `type`/
  `interface` in `shared/types/` or are inferred from a Zod schema via
  `z.infer<typeof Schema>` in `shared/schemas/` or `server/schemas/` —
  never duplicate a shape by hand in two places when it can be inferred
  once.
- Import types with `import type { ... }` (enforced by keeping
  `verbatimModuleSyntax`-style hygiene) so type-only imports never pull in
  runtime code.

## Import organization

- Prefer Nuxt/Nitro auto-imports (composables, components, server utils)
  over explicit relative imports — don't manually import something Nuxt
  already auto-imports.
- When an explicit import is needed across the `app/`↔`server/` boundary,
  import through the `#shared/*` alias, never a relative
  `../../shared/...` path.
- Within a single layer (e.g. `server/api/*` importing `server/utils/*`),
  relative imports are fine since Nitro doesn't auto-import across all of
  `server/`.
- Group imports: external packages first, then aliased (`#shared`, `~`),
  then relative — separated by a blank line.

## Error handling

- **Server**: throw H3's `createError({ statusCode, statusMessage })` for
  any failure. Never swallow an error silently or return `200` with an
  error payload. Nitro's default error formatting is the single source of
  truth for the error response shape — don't hand-roll a different one.
- **Client**: handle `useFetch`/`$fetch` errors explicitly at the call site
  (loading/error/success states) — never let an unhandled rejection reach
  the user as a blank screen. Design the loading/empty/error/success states
  for every data-fetching view (see `product-design` skill) before building
  the happy path only.
- Validate at boundaries only: server API input (via Zod) and client forms
  (via the same shared Zod schema, once one exists). Don't add defensive
  validation for data that only ever comes from your own trusted code.

## API communication conventions

- Successful responses: `{ success: true, data }` (the `ApiSuccess<T>`
  shape in `shared/types/api.ts`), produced via `server/utils/response.ts#success()`.
- Failures: thrown via `createError`, which Nitro serializes consistently —
  client code treats any non-2xx response as the error case.
- One Nitro endpoint file per route + method (`health.get.ts`,
  `orders.post.ts`, etc.) — don't branch on `event.method` inside a single
  catch-all handler when file-based method routing covers it.
- Endpoint handlers stay thin: parse/validate input → call a service
  function (once services exist) → return `success(result)`. No `fs`
  access and no business rules directly in a handler.

## Styling conventions

- Tailwind utility classes are the default. Global CSS (`app/assets/css/main.css`)
  is reserved for the `@theme` token definitions and the handful of true
  resets/base rules already there — don't add component-specific rules to
  it.
- Design tokens (color, spacing, radius, font) are defined once via
  Tailwind's `@theme` block and consumed via utility classes
  (`text-brand-600`, `rounded-lg`, etc.) — never hardcode a hex color or
  pixel value in a component when a token exists.
- RTL/LTR: use logical-property utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`,
  `text-start`, `text-end`, `rtl:`/`ltr:` variants only as a last resort)
  instead of `pl-*`/`pr-*`/`left-*`/`right-*`, so layouts flip correctly
  under `dir="rtl"` automatically.
- Responsive breakpoints: use Tailwind's default scale (`sm`, `md`, `lg`,
  `xl`, `2xl`) consistently; don't introduce custom one-off breakpoints.

## Rules for avoiding unnecessary abstractions

- Don't create a composable, component, or utility until it's needed a
  **second** time. The first occurrence lives inline.
- Don't add a folder from the reference architecture before it has a real
  file to put in it (see the "Status" columns in `docs/architecture.md`).
- Don't introduce a new dependency (state library, HTTP client, UI kit,
  etc.) when Nuxt's built-ins (`useState`, `$fetch`, Tailwind) already
  cover the need — see the Pinia decision in `docs/architecture.md`.
- Don't add configuration flags, feature toggles, or generic
  "extensibility" for requirements that haven't been asked for yet.
