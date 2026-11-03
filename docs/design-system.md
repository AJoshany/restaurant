# Design System

The shared, reusable UI primitives for all four areas (`/`, `/kiosk`,
`/staff`, `/admin`). This is the first UI layer in the project — see
roadmap phase 5 in `docs/development-roadmap.md`. It defines tokens and
presentation-only components; it does not implement any application page.

Read `docs/coding-conventions.md` for the general styling/RTL/component
rules this document builds on — this file is the concrete reference for
what tokens and primitives already exist, so new UI work reuses them
instead of inventing one-offs.

## Principles

- **Tokens are the single source of truth.** Every color, radius, and
  spacing value used in a component traces back to `@theme` in
  `app/assets/css/main.css` (custom tokens) or Tailwind's own default scale
  (type sizes, weights, spacing steps, which remain available — Tailwind
  v4's `@theme` block is additive, not a replacement for the defaults).
  Never hardcode a hex color or one-off pixel value in a component.
- **RTL/LTR by construction, not by override.** Components use logical
  properties (`ps-*`/`pe-*`/`text-start`, flex `gap`) instead of
  `pl-*`/`pr-*`/`left-*`/`right-*`. Flexbox `row` direction already follows
  the document's writing direction, so icon/content ordering flips
  automatically under `dir="rtl"` with no extra classes.
- **Presentation only.** Nothing under `app/components/ui/` fetches data,
  reads route state, or knows about products/orders. Props and slots are
  the entire contract; business logic/i18n copy stays in the caller.
- **Accessible by default.** Labels are linked to controls via
  `useId()`-generated ids, errors use `role="alert"` and
  `aria-describedby`/`aria-invalid`, loading states expose `aria-busy` or
  `role="status"`.

## Tokens (`app/assets/css/main.css`)

| Token                            | Purpose                                                                                                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--font-sans`                    | Global font stack, led by self-hosted `Vazirmatn` (`public/fonts/`, SIL OFL) — covers Persian/Arabic and Latin in one variable file, so both locales share one typeface; system/Tahoma fallbacks follow. |
| `--color-brand-50`…`900`         | Primary brand color scale.                                                                                                                                                                               |
| `--color-success-50/500/600/700` | Positive state (e.g. valid input, "ready"-style confirmations).                                                                                                                                          |
| `--color-warning-50/500/600/700` | Caution state.                                                                                                                                                                                           |
| `--color-danger-50/500/600/700`  | Destructive/error state (form validation, danger button).                                                                                                                                                |
| `--color-info-50/500/600/700`    | Informational state.                                                                                                                                                                                     |
| `--radius-sm/md/lg/xl`           | Border-radius scale used by cards, inputs, buttons.                                                                                                                                                      |
| `--spacing-section`              | Large section spacing (page-level, not component-level).                                                                                                                                                 |

The semantic state scales mirror Tailwind's own green/amber/red/blue hex
values, so `bg-success-50`/`text-success-700` etc. read consistently with
any place the ecosystem's default palette is also used.

**Color scheme**: the design system is light-only. `:root` sets
`color-scheme: light` (never `light dark`), so native controls — select
popups, checkboxes, scrollbars, date pickers — follow the light UI instead of
turning dark on a dark-mode OS. There is no `dark:` variant anywhere.

**Typography** intentionally has no custom scale beyond `--font-sans` —
Tailwind's default `text-*`/`font-*` utilities are the token system. Use
this subset consistently rather than arbitrary values (`text-[15px]`):

| Use                          | Classes                              |
| ---------------------------- | ------------------------------------ |
| Page title (h1)              | `text-2xl sm:text-3xl font-semibold` |
| Section heading (h2)         | `text-xl sm:text-2xl font-semibold`  |
| Card/subsection heading (h3) | `text-lg font-semibold`              |
| Body text                    | `text-base`                          |
| Secondary/caption text       | `text-sm text-gray-500`              |

**Responsive utilities**: use Tailwind's default breakpoints
(`sm`/`md`/`lg`/`xl`/`2xl`) only — no custom breakpoints. Page-level
containers should follow the existing `index.vue` pattern:
`mx-auto max-w-screen-{sm,md,...} p-6` (or the card's built-in responsive
padding — see `BaseCard` below).

## Components (`app/components/ui/`)

Registered with `pathPrefix: false` (see `nuxt.config.ts`), so they're used
by their own name directly, e.g. `<BaseButton>` — no `Ui` prefix.

### `BaseButton`

Variants: `primary` (default) / `secondary` / `outline` / `ghost` /
`danger`. Sizes: `sm` / `md` / `lg`. Props: `type`, `disabled`, `loading`
(shows a decorative inline spinner and sets `aria-busy`), `block` (full
width).

```vue
<BaseButton variant="primary" :loading="isSubmitting" @click="submit">
  {{ t('kiosk.placeOrder') }}
</BaseButton>
```

### `BaseInput` / `BaseTextarea`

Props: `modelValue` (`v-model`), `label`, `hint`, `error`, `required`,
`disabled`, `placeholder`, `name`; `BaseInput` also takes `type` (`text` /
`email` / `password` / `number` / `tel` / `search`) and `size`;
`BaseTextarea` takes `rows`. When `error` is set, the field renders with
`aria-invalid` and a `role="alert"` message; `hint` is hidden while an
error is showing.

```vue
<BaseInput v-model="email" :label="t('form.email')" :error="emailError" required type="email" />
```

Both are built on `BaseFormField`, the internal label/hint/error wrapper
(exposes `{ id, describedBy, invalid }` via a scoped slot) — reuse
`BaseFormField` directly if a future control (e.g. a select) needs the same
label/error shape.

### `BaseCard`

Props: `padding` (`none` / `sm` / `md` / `lg`, default `md`, already
responsive — e.g. `md` is `p-4 sm:p-6`). Slots: `header`, default,
`footer`.

```vue
<BaseCard>
  <template #header>
    <h2 class="text-lg font-semibold">{{ t('staff.ordersQueue') }}</h2>
  </template>
  ...
</BaseCard>
```

### `BaseBadge`

Variants: `neutral` (default) / `brand` / `success` / `warning` /
`danger` / `info`. Sizes: `sm` / `md`. Useful for order-status chips once
real order UI exists — map `OrderStatus` to a variant at the call site
(keeps the status→color mapping out of this generic primitive).

```vue
<BaseBadge variant="info">{{ t(`order.status.${order.status}`) }}</BaseBadge>
```

### `BaseSpinner`

Props: `size` (`sm` / `md` / `lg`), `label` (optional). Omit `label` for a
decorative spinner (e.g. inside `BaseButton`, which already announces
`aria-busy`); pass `label` for a standalone loading indicator, which
renders `role="status"` with a visually-hidden (`sr-only`) accessible name.

```vue
<BaseSpinner v-if="pending" :label="t('common.loading')" />
```

### `BaseEmptyState`

Props: `title` (required), `description`. Slots: `icon`, `actions`. Used
for empty lists (no orders yet, no products yet) — pair with a retry/CTA
action in the `actions` slot.

```vue
<BaseEmptyState :title="t('staff.noOrders')" :description="t('staff.noOrdersHint')">
  <template #actions>
    <BaseButton size="sm" @click="refresh">{{ t('common.refresh') }}</BaseButton>
  </template>
</BaseEmptyState>
```

Page-specific sections (e.g. the landing page's hero/story/gallery blocks in
`app/components/landing/`) are **not** part of this design system — they
compose the primitives above but aren't generic or reused elsewhere, so they
don't belong under `app/components/ui/`. See `docs/architecture.md`.

## What's deliberately not here

- No `Heading`/`Container`/`Select` components — not asked for yet and
  nothing needs them twice yet (see "Rules for avoiding unnecessary
  abstractions" in `docs/coding-conventions.md`). Add them the same way as
  everything above, once a real page needs one.
- No dark mode — not a stated product requirement.
- No loading **skeleton** component — only the spinner/empty-state pair
  requested; add a skeleton primitive if a future screen needs one.
