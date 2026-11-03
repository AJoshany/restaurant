# Restaurant Ordering Platform

A single-restaurant ordering platform with four areas sharing one
server-side JSON data store (no database):

| Area    | Route    | Audience         | Purpose                                        |
| ------- | -------- | ---------------- | ---------------------------------------------- |
| Landing | `/`      | Public           | Informational/marketing page.                  |
| Kiosk   | `/kiosk` | Customers        | Browse the menu, build a cart, place an order. |
| Staff   | `/staff` | Restaurant staff | View incoming orders, advance their status.    |
| Admin   | `/admin` | Administrators   | Review every order (full detail).              |

Bilingual (English `en-US` LTR, Persian `fa-IR` RTL), fully responsive, and
keeps all four areas in sync within 5 seconds of any data change via
polling. See [docs/project-overview.md](docs/project-overview.md) for the
full product picture.

## Tech stack

Nuxt 4 · Vue 3 (Composition API) · TypeScript (strict) · Tailwind CSS v4 ·
`@nuxtjs/i18n` · Zod · a Nitro server API persisting to a single JSON file
(no database, no Pinia — see [docs/architecture.md](docs/architecture.md)
for rationale).

## Prerequisites

- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` (see `engines` in
  [package.json](package.json) — this is Nuxt 4's own requirement).
- npm (the project uses `package-lock.json`; don't mix package managers).

## Installation

```bash
npm install
```

`postinstall` runs `nuxt prepare` automatically.

## Running the app

```bash
# Development server (http://localhost:3000, hot reload)
npm run dev

# Production build
npm run build

# Run the production build (after `npm run build`)
npm run start
# or, for a build + local preview in one step:
npm run preview
```

The production server reads `PORT`/`HOST` from the environment (standard
Nitro `node-server` preset behavior; defaults to `3000`/`0.0.0.0`).

## Environment variables

No environment variable is required — the app works out of the box with
its defaults. See [.env.example](.env.example) for the one supported
variable (`DATA_FILE_PATH`, overriding where the JSON data store lives) and
[docs/deployment.md](docs/deployment.md) for the full reference and
deployment-time implications.

## Quality checks

Run these before considering any change done (see [AGENTS.md](AGENTS.md)):

```bash
npm run typecheck     # TypeScript strict, via nuxt typecheck
npm run lint           # ESLint
npm run format:check   # Prettier (use `npm run format` to fix)
npm run build          # production build
npm run test           # Vitest: unit + API integration tests
```

All five currently pass — see [docs/delivery-report.md](docs/delivery-report.md)
for the latest recorded run and what else was verified beyond these
automated checks (concurrency, persistence-after-restart, locale/RTL
rendering, etc.).

## Project structure and conventions

See [docs/architecture.md](docs/architecture.md) for folder responsibilities
and layering, and [docs/coding-conventions.md](docs/coding-conventions.md)
for naming/style rules. [docs/development-roadmap.md](docs/development-roadmap.md)
tracks what's built and what's intentionally deferred.

## Data storage and backups

All application data (products, orders) lives in a single JSON file
(`.data/data.json` by default, gitignored). There is no database.
See [docs/deployment.md](docs/deployment.md#data-storage-backup-and-restore)
for backup/restore procedure and the single-process concurrency limitation.

## API documentation

Full endpoint contracts (request/response shapes, validation rules, error
format): [docs/api-reference.md](docs/api-reference.md). Entity shapes:
[docs/data-model.md](docs/data-model.md).

## Deployment

See [docs/deployment.md](docs/deployment.md).

## Documentation index

| Document                                                   | Covers                                               |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| [docs/project-overview.md](docs/project-overview.md)       | Product scope, roles, lifecycle, limitations.        |
| [docs/architecture.md](docs/architecture.md)               | Folder structure, layering, persistence, sync, i18n. |
| [docs/data-model.md](docs/data-model.md)                   | Entity shapes, JSON storage format.                  |
| [docs/api-reference.md](docs/api-reference.md)             | Endpoint contracts.                                  |
| [docs/design-system.md](docs/design-system.md)             | Design tokens and base UI components.                |
| [docs/coding-conventions.md](docs/coding-conventions.md)   | Naming, structure, style rules.                      |
| [docs/development-roadmap.md](docs/development-roadmap.md) | Build order, what's done vs. deferred.               |
| [docs/deployment.md](docs/deployment.md)                   | Deployment, environment variables, backup/restore.   |
| [docs/ai-usage-report.md](docs/ai-usage-report.md)         | How AI tools were used to build/review this project. |
| [docs/delivery-report.md](docs/delivery-report.md)         | Final production-readiness review results.           |

## Known limitations

No database (single JSON file, single-process write safety only), no
authentication on `/staff`/`/admin`, no payment processing, no order
cancellation, no WebSockets (polling-based sync by design). Full list with
rationale: [docs/project-overview.md](docs/project-overview.md#explicit-limitations-and-non-goals)
and [docs/delivery-report.md](docs/delivery-report.md#remaining-limitations).
