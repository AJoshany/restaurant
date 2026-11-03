# AGENTS.md

## Project Overview

A restaurant ordering platform with four areas sharing one server-side JSON
data store (no database):

- `/` — public restaurant landing page
- `/kiosk` — customer ordering interface
- `/staff` — staff order management panel
- `/admin` — administrator panel

The app supports Persian (`fa-IR`, RTL) and English (`en-US`, LTR), is fully
responsive, and keeps kiosk/staff/admin in sync within 5 seconds of a data
change (via polling — see `docs/architecture.md`).

**Read `docs/architecture.md`, `docs/coding-conventions.md`, and
`docs/development-roadmap.md` before modifying this codebase.** They contain
the folder responsibilities (including which folders are intentionally not
created yet, and why), the data/API conventions, and the intended build
order. Do not re-derive architecture decisions already made there.

## Project Context

- Nuxt 4
- Vue 3 (Composition API)
- TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme` tokens)
- `@nuxtjs/i18n` (Persian/English, RTL/LTR)
- Zod (runtime validation)
- Nitro server API (`server/api`) for the backend, persisting to a single
  `.data/data.json` file via `server/utils/storage.ts`
- No Pinia (deferred — see "State management strategy" in
  `docs/architecture.md`)
- npm

## General Development Rules

- Follow official Nuxt 4 conventions.
- Use TypeScript everywhere.
- Prefer clean, readable, maintainable code.
- Avoid unnecessary dependencies.
- Avoid premature abstractions.
- Keep responsibilities separated (presentation, logic, data access).
- Do not introduce hardcoded business values unnecessarily - use configuration or constants.
- Analyze existing code before making changes; prefer reusing an existing
  utility/composable/component over writing a new one.
- Avoid duplicate logic — if the same shape or behavior is needed in two
  places, extract it once (see import/typing rules in
  `docs/coding-conventions.md`) rather than copying it.
- Preserve existing working functionality. Never introduce a breaking
  change without an explicit, stated reason.

## TypeScript Requirements

- Strict mode (`typescript.strict: true`) stays on. `npm run typecheck`
  must pass before any change is considered done.
- Avoid `any`; use `unknown` + narrowing or a precise type instead.
- Shared data shapes live in `shared/types/` or are inferred from Zod
  schemas in `shared/schemas/`/`server/schemas/` via `z.infer<...>` — never
  hand-duplicated in two files.
- Full conventions: `docs/coding-conventions.md`.

## Component and Composable Guidelines

- Components: `<script setup lang="ts">` + typed `defineProps`/
  `defineEmits`; presentation only. Extract any non-trivial logic into a
  composable.
- Split a component the moment it takes on a second responsibility.
- Composables are for shared _reactive_ logic only, and only once that
  logic is actually shared by more than one place — don't create one
  speculatively.
- Full conventions, including naming and file organization:
  `docs/coding-conventions.md`.

## Styling and Internationalization Rules

- Tailwind utilities are the default styling mechanism; design tokens are
  defined once via the `@theme` block in `app/assets/css/main.css` — no
  hardcoded colors/spacing that duplicate an existing token.
- Use logical-property utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`,
  `text-start`/`text-end`) instead of `left`/`right`/`pl`/`pr`, so UI flips
  correctly under `dir="rtl"`.
- Never hardcode user-facing text in a component — add a key under
  `i18n/locales/en-US.json` and `i18n/locales/fa-IR.json` and read it via
  `useI18n()`/`t()`.
- The supported locale list is defined once in `shared/constants/i18n.ts` —
  don't hardcode locale codes elsewhere.

## Backend and JSON Persistence Rules

- All persisted data lives in `.data/data.json`, accessed **only** through
  `server/utils/storage.ts`'s `readData()`/`writeData()` — no other file
  touches `fs` for this data.
- Validate all incoming request data on the server with Zod — never trust
  the client. Validate the data file's shape on every read/write via
  `DataFileSchema`.
- Writes go through the existing atomic-write + in-process write-queue
  logic already in `storage.ts` — don't bypass it or add a second
  persistence path.
- Keep HTTP handlers (`server/api/*`) thin: parse/validate → call a
  service/repository function → return `success(data)` (from
  `server/utils/response.ts`) or throw `createError`.
- Full conventions: `docs/architecture.md` (persistence architecture,
  sync strategy) and `docs/coding-conventions.md` (API conventions).

## Testing and Validation Requirements

Before reporting any change as done:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check` (or `npm run format` to fix)
4. `npm run build`
5. For UI changes, actually run `npm run dev` and exercise the feature in
   a browser — don't claim success from type/lint checks alone. Check both
   locales/directions and responsive breakpoints when the change touches
   layout (see the `quality-assurance` skill).

## Agent Workflow

For every future development task, follow this workflow:

1. **Analyze** - Understand the task and inspect relevant files.
2. **Plan** - Define the implementation approach and affected files.
3. **Implement** - Make only the changes required by the approved plan.
4. **Validate** - Run relevant checks and tests.
5. **Review** - Evaluate architecture, code quality, and regressions.
6. **Report** - Summarize changes, decisions, and validation results.
7. **Wait for Approval** - Do not start the next development phase until explicitly approved.

## Skill Usage

Use the relevant project skill (`.claude/skills/`) whenever a task falls within its responsibilities:

- UI/UX and visual decisions → `product-design`
- Vue/Nuxt implementation → `frontend-engineering`
- API and persistence → `backend-data-engineering`
- Testing → `quality-assurance`
- Independent code review → `code-review`
