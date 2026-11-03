# AI Usage Report

This project was built and reviewed with Claude Code (Anthropic's CLI
coding agent) acting under the governance rules in [AGENTS.md](../AGENTS.md):
every phase follows **Analyze → Plan → Implement → Validate → Review →
Report → Wait for Approval**, and no change is reported done without the
listed quality gates passing.

This report has two parts: what is directly known from this review session
(exact prompt, exact tool calls, exact results), and what is inferable from
the repository's own history for everything built before this session. It
does not invent prompt text for work it didn't observe.

## Tooling

- **Agent**: Claude Code, model Claude Sonnet 5 (`claude-sonnet-5`).
- **Tool surface used in this session**: shell execution (reading
  `package.json`/config, running `npm run typecheck|lint|format:check|test|build`,
  starting the production server, issuing `curl`/Node `fetch` requests
  against it), file read/search (`docs/*.md`, `AGENTS.md`, `app/`, `server/`,
  `shared/`), and targeted file edits (`package.json`, `README.md`,
  this document, `docs/deployment.md`, `docs/delivery-report.md`). No
  browser-automation tool was available in this session (no Chrome
  extension / in-app browser connector was offered) — see
  [docs/delivery-report.md](delivery-report.md) for exactly which checks
  that limited.

## This session: the production-readiness review

**Actual prompt received** (verbatim, via the user's pasted instructions):

> Read AGENTS.md and the complete project documentation.
>
> Perform a final production-readiness review.
>
> Verify: Production build. TypeScript strict checks. ESLint. Prettier.
> Unit tests. API integration tests. End-to-end ordering flow. Data
> persistence after server restart. Concurrent order creation.
> Cross-browser synchronization. Persian and English functionality. RTL
> and LTR layouts. Responsive behavior. Error and empty states.
>
> Fix all issues introduced by the project implementation.
>
> Prepare: Final README with installation and execution instructions.
> Environment variable documentation. JSON data storage and backup
> instructions. API documentation. Deployment instructions. A concise AI
> usage report describing tools, actual prompts, and how outputs were
> reviewed and corrected.
>
> Do not claim successful validation unless the corresponding checks were
> actually executed.
>
> Provide a final delivery report with test results and remaining
> limitations.

**How it was executed and reviewed** (summary; full results in
[docs/delivery-report.md](delivery-report.md)):

1. Read `AGENTS.md` and every file in `docs/` before touching anything, per
   AGENTS.md's own instruction not to re-derive architecture decisions
   already made there.
2. Ran the five automated gates (`typecheck`, `lint`, `format:check`,
   `test`, `build`) directly via their npm scripts and inspected real exit
   codes and output — not assumed from a prior run.
3. Since no browser-automation tool was available, built the project
   (`npm run build`) and ran the **actual production server**
   (`node .output/server/index.mjs`) against an isolated temp data file
   (`DATA_FILE_PATH` override, so the review never touched the project's
   real `.data/data.json`), then drove it with real HTTP requests
   (`curl`/Node `fetch`) to verify behavior that static analysis can't
   confirm: validation error codes, status-transition enforcement,
   concurrent order creation (30 parallel `POST /api/orders`), persistence
   across a process restart, corrupted-file handling, and SSR
   locale/`dir` output for both `en-US` and `fa-IR`.
4. Reviewed the component/composable source for the checks that genuinely
   need a rendered browser to fully confirm (visual RTL layout, visual
   responsive breakpoints) — grepped for physical-direction Tailwind
   utilities (`pl-`, `pr-`, `left-`, `right-`, `ml-`, `mr-`) across `app/`,
   confirmed zero matches, and read the loading/error/empty-state branches
   in each page/list component against the i18n key sets in both locale
   files (confirmed 100/100 key parity, no missing translations).
5. No implementation defects were found during this pass — all five gates
   passed and every manually-exercised behavior matched its documented
   contract (see [docs/api-reference.md](api-reference.md) and
   [docs/data-model.md](data-model.md)). The only changes made were
   additive, non-breaking deployment conveniences
   (`package.json`: a `start` script and an `engines.node` constraint
   matching Nuxt 4's own requirement) and the documentation deliverables
   listed in the prompt. Nothing was reverted or corrected because nothing
   broken was found — this is stated plainly rather than implying a
   correction cycle that didn't happen.
6. This report and the delivery report are themselves part of the
   deliverable, written after the checks above completed, not before.

## Before this session: evidence from project history

This session did not have access to the exact prompts used in earlier
development phases, so none are reproduced here. What's directly
verifiable from the repository itself:

- **Commit history** (`git log`) shows 12 commits following the exact
  phase sequence in
  [docs/development-roadmap.md](development-roadmap.md): tooling →
  skills/config → data core & server → server tests → design system →
  landing → kiosk → staff → admin → orders section — consistent with the
  AGENTS.md-mandated phase-by-phase workflow rather than one large
  undifferentiated change.
- **`docs/development-roadmap.md`** documents specific defects found and
  fixed during its own phase-10 validation pass (before this session): a
  `usePolling` overlapping-tick race and a `mergeOrderUpdates` stale-write
  race, both now covered by dedicated tests
  (`app/utils/order-updates.test.ts`,
  `server/api/orders.test.ts`'s synchronization suites) — i.e., the
  project's own documentation already records at least one prior
  AI-assisted review/correction cycle, independent of this session's.
- **`AGENTS.md`** is itself the standing instruction set that shaped every
  phase's prompt (workflow, skill routing, testing gates) — this session
  followed the same document rather than a new one.

## How outputs were reviewed and corrected (this session)

- Every claim in [docs/delivery-report.md](delivery-report.md) is backed by
  a command actually run and its actual output, not inferred from reading
  code alone — e.g. the concurrency claim is backed by a 30-request
  parallel test against the real HTTP server showing 30 unique ids and 30
  unique order numbers, not just a reading of the write-queue code.
- Where a requested check could not be executed with the tools available
  in this session (real visual RTL rendering, real visual responsive
  breakpoints, a real second-browser-session sync demo), this is stated
  explicitly in the delivery report as a verification-method limitation
  rather than reported as a passed visual test.
- The two `package.json` edits were verified by actually running the
  affected commands (`format:check`, and starting the server via
  `npm run start` against the real build output) before being reported as
  working.
