# Production Readiness Plan

Date: 2026-11-03. Branch: `dev` (`origin/dev`, head `2577dc3`).

## 1. Source of truth

The `Final Delivery Report` referenced by this task **is** in this
repository on the `dev` branch: [`docs/delivery-report.md`](delivery-report.md).
It records four confirmed UI defects and four remaining assignment gaps on
top of the already-implemented app (landing, kiosk, staff, admin, orders,
polling sync).

Every item below was **re-verified against the current `dev` code** before
being changed — none were taken on trust from the report. All eight items
were still present in the codebase as described.

## 2. Prioritized plan and current status

| #   | Item (report reference)                                                                      | Verified state before | Status                                                                                       |
| --- | -------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| P1  | **Persian typography** — no Persian web font, system-only `--font-sans` (defect 1)           | Confirmed             | Fixed                                                                                        |
| P2  | **Color scheme** — `color-scheme: light dark` with no dark theme (defect 2)                  | Confirmed             | Fixed                                                                                        |
| P3  | **Scroll-driven movement** — one-shot IntersectionObserver reveal (defect 3, gap #2)         | Confirmed             | Fixed                                                                                        |
| P4  | **Shared navigation** — no header outside `/`, no nav/locale on kiosk/staff/admin (defect 4) | Confirmed             | Fixed                                                                                        |
| P5  | **Real interior photography** — landing used SVG illustrations (gap #1)                      | Confirmed             | Fixed                                                                                        |
| P6  | **AI usage report** — only 1 of the required 3 actual prompts (gap #3)                       | Confirmed             | **Open — needs the author's own session transcripts; cannot be reconstructed from the repo** |
| P7  | **Live two-browser sync demonstration** (gap #4)                                             | Confirmed             | **Open — no browser automation in this environment; server contract is covered by tests**    |
| P8  | **Screen recording deliverable** (gap #5)                                                    | Confirmed             | **Open — not a code artifact**                                                               |

## 3. What changed

### P1 — Persian typography

- `public/fonts/Vazirmatn-Variable.woff2` (variable, weights 100–900) +
  `public/fonts/OFL.txt` (SIL OFL 1.1), self-hosted — no CDN request.
- `app/assets/css/main.css`: `@font-face` with `font-weight: 100 900`,
  `font-display: swap`; `--font-sans` now leads with `Vazirmatn` and keeps
  system/Tahoma fallbacks. One file serves Persian **and** Latin, so `en-US`
  and `fa-IR` share a typeface instead of drifting per OS.
- `nuxt.config.ts`: `rel="preload"` for the font file so the swap window
  stays short (no delayed text paint, no visible metric jump on first load).

### P2 — Color scheme

- `:root { color-scheme: light; }` — native controls (select popups,
  checkboxes, scrollbars, date pickers) now follow the light design system.
  No dark theme was added.

### P3 — Scroll-progress parallax

- New `app/composables/useScrollParallax.ts`: a **single** passive `scroll`
  listener + one `resize` listener + one `ResizeObserver`, all coalesced into
  a single `requestAnimationFrame` update per frame. Element geometry is
  measured once and re-measured on resize/reflow, so per-frame work is
  arithmetic only — no layout reads per frame and no per-image listeners.
- Progress is `0` → `1` as an element crosses the viewport.
  `prefers-reduced-motion: reduce` is exposed as a flag the image component
  checks: movement (parallax + zoom) is dropped entirely, while the
  opacity-only reveal still runs, so those users get a calm fade rather than a
  completely static page.
- `app/components/shared/ParallaxImage.vue` turns that progress into motion:
  the image is scaled by 1.24 inside an `overflow-hidden` frame and translated
  by ±`travel`% of its own height (default 10%), so a 400px-tall image travels
  80px across its pass — visible, without the frame edge ever showing.
- The same progress drives a reveal: the frame fades in and the image settles
  from a slight extra zoom (1.32 → 1.24) as it enters, so an image below the
  fold visibly arrives. Both effects are pure functions of progress
  (`app/utils/scroll-effects.ts`), so they rewind when scrolling back up and
  there is no latch or timer that can desynchronise. The reveal is
  opacity/zoom-only rather than a translate: sliding the clipped frame inside
  a card would leave a visible gap.
- Amplitude matters: the first iteration moved the image only ~4% of the
  scrolled distance (≈22px over 570px), which read as "no animation" in the
  running app. Travel is now ~4× larger and paired with the reveal.
- Hydration-safe: progress starts at the neutral `0.5` on both server and
  first client render, so SSR markup and the first client frame agree; the
  real value lands on the next frame after mount. Because `reveal` is 1 at the
  neutral value, content is always visible in SSR, with JS disabled, or if
  tracking never runs — only a real "still below the viewport" measurement
  can fade an image out (off-screen).
- `useScrollReveal` and the reveal-once behavior were removed (no remaining
  callers).
- Tested without a browser: `app/utils/scroll-effects.test.ts` covers the
  exact transform/reveal strings, and `app/composables/useScrollParallax.test.ts`
  stubs the viewport to verify registration, a single shared scroll listener,
  progress tracking, the resulting `translate3d` value, reduced-motion
  neutralisation and unmount cleanup.

### P4 — Shared navigation

- `app/components/shared/AppHeader.vue` + `LocaleSwitcher.vue` are rendered
  from `app/layouts/default.vue`, so `/`, `/kiosk`, `/staff` and `/admin` all
  get brand/home navigation, a language switcher and a mobile menu.
- `shared/constants/navigation.ts` is the single source of links, per area:
  public → Home (+ "Order Now" CTA); **kiosk → no operational links**
  (customer-facing); staff/admin → staff ↔ admin + "Back to site". The
  layout is not a moved copy of the landing header — each area gets the
  links it actually needs.
- Language switching uses `setLocale` with the existing `no_prefix` strategy,
  so the current route and query string are preserved.
- Mobile: toggle button with `aria-expanded`/`aria-controls`, closes on
  route change; the switcher stays visible on small screens.
- `LandingHeader.vue` was deleted (duplicate nav logic); the footer reuses
  `LocaleSwitcher` instead of re-implementing locale buttons.

### P5 — Real interior photography

- Four self-hosted restaurant interior photographs in
  `public/images/`: `hero-dining-room`, `dining-hall`, `heritage-room`,
  `private-table`, each in AVIF **and** WebP at 900px and 1600px.
- `app/utils/landing-images.ts` holds the paths/dimensions once;
  `ParallaxImage` emits `<picture>` with AVIF → WebP → `<img>` fallback,
  `srcset`/`sizes`, intrinsic `width`/`height`, `loading="lazy"` below the
  fold and `eager` + `fetchpriority="high"` for the hero.
- The gallery was re-themed from dishes to rooms (it previously showed dish
  illustrations), with matching copy in both locales.
- `public/images/landing/*.svg` deleted (no remaining references).

## 4. Verification

Run on `dev` after the changes:

| Command                | Result                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `npm run typecheck`    | Pass (exit 0)                                                                      |
| `npm run lint`         | Pass (exit 0)                                                                      |
| `npm run format:check` | Pass (after fixing one pre-existing formatting drift in `docs/delivery-report.md`) |     | `npm run test` | Pass — 17 files, 137 tests (incl. 21 new scroll-effect tests) |
| `npm run build`        | Pass — clean Nuxt/Nitro `node-server` build                                        |

`npm install` was required first: `dev` adds `vitest`, which the previously
installed `node_modules` (from `main`) did not have.

Server-rendered output checked against the running dev server (HTTP level,
both locales):

- `/`, `/kiosk`, `/staff`, `/admin` all return `200` and include the shared
  `<header>`.
- `/` contains the font `preload`, 5 AVIF + 5 WebP `<source>` elements, a
  single `fetchpriority="high"` hero image, and **zero** references to the
  removed `landing/*.svg`.
- `/kiosk` contains **no** `/staff` or `/admin` links (operational nav is not
  exposed to customers); `/staff` and `/admin` link to each other plus
  `Back to site`, with `aria-current="page"` on the active link.
- `fa-IR` renders `<html lang="fa-IR" dir="rtl">` with Persian nav copy.
- Built CSS contains `color-scheme:light`, the `Vazirmatn` `@font-face`
  (weight range 100–900, `font-display:swap`) and the updated `--font-sans`;
  the font file itself is served as `200 font/woff2`.
- SSR emits the neutral parallax transform on all 5 images, so the server
  markup and first client frame agree (no hydration mismatch from the
  animation state).

## 5. Remaining limitations (not fixed here)

- **Image licensing provenance is not recorded in the repo.** The four
  interior photographs are self-hosted and optimized, but the exact source
  pages/author/licence were not preserved when the assets were prepared, so
  an attribution/credits page cannot be written from what is in the
  repository. Confirm the licence and add credits before publishing.
- **The photographs could not be inspected visually here** (this
  environment cannot render images to the agent), so their subject matter
  was matched by file naming and dimensions only. A human should eyeball the
  landing page once.
- **No browser-automation run.** Layout/RTL/mobile-menu behavior and the
  two-browser sync demonstration (P7) were verified at SSR/HTTP level and by
  the automated suites, not by driving a real browser.
- **Persian copy still needs native-speaker review** (pre-existing).
- **Dish/product imagery is still placeholder SVG** — only the landing page
  interior photography was in scope; `public/images/products/*.svg` remain
  scaffold data for the seeded catalog.
