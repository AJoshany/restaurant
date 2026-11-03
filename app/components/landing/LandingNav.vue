<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const links = [
  { href: '#rooms', labelKey: 'landing.nav.room' },
  { href: '#kitchen', labelKey: 'landing.nav.kitchen' },
  { href: '#visit', labelKey: 'landing.nav.visit' }
] as const

const isMenuOpen = ref(false)
const menuId = useId()
const menuButton = ref<HTMLButtonElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const drawer = ref<HTMLElement | null>(null)

// Shared look for both order links (the compact one in the bar and the full
// one inside the drawer). Size and layout stay with each caller so the two
// never fight over the same utilities.
const ctaBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-cream-50 font-semibold text-ink-900 transition-colors hover:bg-brand-500 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950'

function closeMenu() {
  isMenuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (!isMenuOpen.value) {
    return
  }

  if (event.key === 'Escape') {
    closeMenu()
    menuButton.value?.focus()
    return
  }

  // Keep Tab inside the drawer while it is modal.
  if (event.key !== 'Tab' || !drawer.value) {
    return
  }

  const focusables = Array.from(
    drawer.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
  )
  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (!first || !last) {
    return
  }

  const active = document.activeElement
  const inside = active instanceof Node && drawer.value.contains(active)

  if (!event.shiftKey && (!inside || active === last)) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && (!inside || active === first)) {
    event.preventDefault()
    last.focus()
  }
}

// A side drawer must not let the page scroll behind it. The overflow is set
// inline so the lock never depends on a utility class being generated.
watch(isMenuOpen, (open) => {
  if (!import.meta.client) {
    return
  }

  document.body.style.overflow = open ? 'hidden' : ''

  if (open) {
    void nextTick(() => closeButton.value?.focus())
  }
})

// Reaching the desktop layout while the drawer is open would leave the scroll
// lock behind, so close it as soon as the hamburger disappears.
let desktopQuery: MediaQueryList | null = null

function onDesktopQueryChange(event: MediaQueryListEvent) {
  if (event.matches) {
    closeMenu()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  desktopQuery = window.matchMedia('(min-width: 768px)')
  desktopQuery.addEventListener('change', onDesktopQueryChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  desktopQuery?.removeEventListener('change', onDesktopQueryChange)
  desktopQuery = null
  document.body.style.overflow = ''
})

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  }
)
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-40">
    <div class="bg-gradient-to-b from-ink-950/90 via-ink-950/45 to-transparent">
      <div class="mx-auto flex max-w-screen-xl items-center gap-2 px-5 py-4 sm:gap-4 sm:px-8">
        <NuxtLink
          to="/"
          class="flex shrink-0 items-baseline gap-2 whitespace-nowrap text-base font-semibold text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
        >
          <span>{{ t('app.name') }}</span>
          <span class="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
        </NuxtLink>

        <nav class="ms-8 hidden items-center gap-7 md:flex" :aria-label="t('nav.primary')">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="text-sm text-cream-200/75 transition-colors hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
          >
            {{ t(link.labelKey) }}
          </a>
        </nav>

        <div class="ms-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <div class="hidden sm:block">
            <LocaleSwitcher variant="dark" />
          </div>

          <NuxtLink
            to="/kiosk"
            :class="ctaBase"
            class="shrink-0 px-3.5 py-2 text-sm sm:px-4 sm:text-sm"
          >
            <span class="sm:hidden">{{ t('landing.cta.orderShort') }}</span>
            <span class="hidden sm:inline">{{ t('landing.cta.order') }}</span>
          </NuxtLink>

          <button
            ref="menuButton"
            type="button"
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-cream-100/25 text-cream-100 transition-colors hover:border-cream-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 md:hidden"
            :aria-expanded="isMenuOpen"
            :aria-controls="menuId"
            :aria-label="isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
            @click="isMenuOpen = true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              class="size-4"
              aria-hidden="true"
            >
              <path stroke-linecap="round" d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isMenuOpen" class="fixed inset-0 z-50 md:hidden">
        <div
          class="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
          aria-hidden="true"
          @click="closeMenu"
        />

        <Transition
          appear
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="translate-x-full rtl:-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full rtl:-translate-x-full"
        >
          <div
            :id="menuId"
            ref="drawer"
            role="dialog"
            aria-modal="true"
            :aria-label="t('nav.primary')"
            class="absolute inset-y-0 end-0 flex w-[min(20rem,85vw)] flex-col overflow-y-auto border-s border-cream-100/10 bg-ink-900 px-5 pb-8 pt-5 shadow-2xl"
          >
            <div class="flex items-center justify-between gap-4">
              <p class="text-base font-semibold text-cream-50">{{ t('app.name') }}</p>

              <button
                ref="closeButton"
                type="button"
                class="inline-flex size-9 items-center justify-center rounded-full border border-cream-100/25 text-cream-100 transition-colors hover:border-cream-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                :aria-label="t('nav.closeMenu')"
                @click="closeMenu"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  class="size-4"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav class="mt-8 flex flex-col" :aria-label="t('nav.primary')">
              <a
                v-for="link in links"
                :key="link.href"
                :href="link.href"
                class="border-b border-cream-100/10 py-4 text-lg text-cream-100 transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-900"
                @click="closeMenu"
              >
                {{ t(link.labelKey) }}
              </a>
            </nav>

            <div class="mt-auto flex flex-col gap-6 pt-10">
              <LocaleSwitcher variant="dark" />

              <NuxtLink
                to="/kiosk"
                :class="ctaBase"
                class="w-full px-5 py-3 text-sm"
                @click="closeMenu"
              >
                {{ t('landing.cta.order') }}
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </header>
</template>
