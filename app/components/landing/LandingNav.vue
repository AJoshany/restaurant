<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const links = [
  { href: '#home', labelKey: 'landing.nav.home' },
  { href: '#story', labelKey: 'landing.nav.story' },
  { href: '#visit', labelKey: 'landing.nav.visit' },
  { href: '/kiosk', labelKey: 'landing.nav.menu' }
] as const

const isMenuOpen = ref(false)
const menuId = useId()
const menuButton = ref<HTMLButtonElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const drawer = ref<HTMLElement | null>(null)

let desktopQuery: MediaQueryList | null = null
let previousBodyOverflow = ''

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

function onDesktopQueryChange(event: MediaQueryListEvent) {
  if (event.matches) {
    closeMenu()
  }
}

watch(isMenuOpen, (open) => {
  if (!import.meta.client) {
    return
  }

  if (open) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    void nextTick(() => closeButton.value?.focus())
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
})

watch(
  () => route.fullPath,
  () => closeMenu()
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  desktopQuery = window.matchMedia('(min-width: 1024px)')
  desktopQuery.addEventListener('change', onDesktopQueryChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  desktopQuery?.removeEventListener('change', onDesktopQueryChange)
  desktopQuery = null
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 border-b border-ink-950/15 bg-cream-50/95 backdrop-blur-md"
  >
    <!-- Logo, links and actions sit in three columns on desktop so the links
         stay optically centred whatever the logo/CTA widths are. -->
    <div
      class="mx-auto grid min-h-17 max-w-screen-xl grid-cols-[1fr_auto] items-center gap-3 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-7"
    >
      <NuxtLink
        to="/"
        class="w-fit shrink-0 font-editorial text-[1.45rem] leading-none font-semibold tracking-tight text-ink-950 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tomato-700 rtl:font-sans rtl:text-lg"
      >
        {{ t('app.name') }}
      </NuxtLink>

      <nav class="hidden items-center gap-6 lg:flex xl:gap-9" :aria-label="t('nav.primary')">
        <NuxtLink
          v-for="link in links"
          :key="link.href"
          :to="link.href"
          class="text-[0.65rem] font-semibold tracking-[0.16em] text-ink-950/70 uppercase transition-colors hover:text-tomato-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tomato-700 rtl:tracking-normal"
        >
          {{ t(link.labelKey) }}
        </NuxtLink>
      </nav>

      <div class="flex items-center justify-end gap-2 lg:gap-4">
        <div class="hidden sm:block">
          <LocaleSwitcher variant="editorial" />
        </div>

        <NuxtLink
          to="/kiosk"
          class="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-tomato-700 px-4 text-[0.65rem] font-semibold tracking-[0.12em] text-tomato-700 uppercase transition-colors hover:bg-tomato-700 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato-700 sm:px-5 rtl:tracking-normal"
        >
          <span class="sm:hidden">{{ t('landing.cta.orderShort') }}</span>
          <span class="hidden sm:inline">{{ t('landing.cta.order') }}</span>
        </NuxtLink>

        <button
          ref="menuButton"
          type="button"
          class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ink-950/25 text-ink-950 transition-colors hover:border-tomato-700 hover:text-tomato-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato-700 lg:hidden"
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

    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isMenuOpen" class="fixed inset-0 z-50 h-dvh lg:hidden">
        <div
          class="absolute inset-0 bg-ink-950/45 backdrop-blur-sm"
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
            class="absolute inset-y-0 end-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto border-s border-ink-950/10 bg-cream-50 px-6 pb-8 pt-6 shadow-2xl"
          >
            <div class="flex items-center justify-between gap-4">
              <p
                class="font-editorial text-[1.45rem] leading-none font-semibold text-ink-950 rtl:font-sans rtl:text-lg"
              >
                {{ t('app.name') }}
              </p>

              <button
                ref="closeButton"
                type="button"
                class="inline-flex size-9 items-center justify-center rounded-full border border-ink-950/25 text-ink-950 transition-colors hover:border-tomato-700 hover:text-tomato-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato-700"
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

            <nav class="mt-12 flex flex-col" :aria-label="t('nav.primary')">
              <NuxtLink
                v-for="link in links"
                :key="link.href"
                :to="link.href"
                class="border-b border-ink-950/15 py-4 font-editorial text-3xl text-ink-950 transition-colors hover:text-tomato-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato-700 rtl:font-sans rtl:text-2xl"
                @click="closeMenu"
              >
                {{ t(link.labelKey) }}
              </NuxtLink>
            </nav>

            <div class="mt-auto flex flex-col items-start gap-7 pt-12">
              <LocaleSwitcher variant="editorial" />
              <NuxtLink
                to="/kiosk"
                class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-tomato-700 px-5 text-xs font-semibold tracking-[0.12em] text-cream-50 uppercase transition-colors hover:bg-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato-700 rtl:tracking-normal"
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
