<script setup lang="ts">
import { SITE_NAVIGATION, resolveAppArea } from '#shared/constants/navigation'

const { t } = useI18n()
const route = useRoute()

const area = computed(() => resolveAppArea(route.path))
const links = SITE_NAVIGATION

const showsOrderCta = computed(() => area.value === 'public')
const hasMobileMenu = computed(() => links.length > 0)

const isMenuOpen = ref(false)
const menuId = useId()

const menuButton = ref<HTMLButtonElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const drawer = ref<HTMLElement | null>(null)

let desktopQuery: MediaQueryList | null = null
let previousBodyOverflow = ''

function closeMenu(restoreFocus = false) {
  isMenuOpen.value = false

  if (restoreFocus) {
    void nextTick(() => menuButton.value?.focus())
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!isMenuOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
    return
  }

  if (event.key !== 'Tab' || !drawer.value) return

  const focusables = Array.from(
    drawer.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('hidden'))

  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (!first || !last) return

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

watch(isMenuOpen, async (open) => {
  if (!import.meta.client) return

  if (open) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    await nextTick()
    closeButton.value?.focus()
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

  desktopQuery = window.matchMedia('(min-width: 768px)')
  desktopQuery.addEventListener('change', onDesktopQueryChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)

  desktopQuery?.removeEventListener('change', onDesktopQueryChange)
  desktopQuery = null

  document.body.style.overflow = previousBodyOverflow
})

function isActive(path: string): boolean {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-screen-xl items-center gap-4 px-6 py-3">
      <NuxtLink to="/" class="text-lg font-semibold text-brand-600">
        {{ t('app.name') }}
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav
        v-if="links.length > 0"
        class="hidden items-center gap-1 md:flex"
        :aria-label="t('nav.primary')"
      >
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          :to="item.path"
          :aria-current="isActive(item.path) ? 'page' : undefined"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100"
          :class="isActive(item.path) ? 'text-brand-700' : 'text-gray-700 hover:text-brand-600'"
        >
          {{ t(item.labelKey) }}
        </NuxtLink>
      </nav>

      <div class="ms-auto flex items-center gap-3">
        <LocaleSwitcher />

        <NuxtLink v-if="showsOrderCta" to="/kiosk" class="hidden md:block">
          <BaseButton size="sm">
            {{ t('landing.cta.order') }}
          </BaseButton>
        </NuxtLink>

        <!-- Mobile Menu Trigger -->
        <button
          v-if="hasMobileMenu"
          ref="menuButton"
          type="button"
          class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden"
          :aria-expanded="isMenuOpen"
          :aria-controls="menuId"
          :aria-label="t('nav.openMenu')"
          @click="isMenuOpen = true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="size-5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Drawer: Render outside Header stacking context -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isMenuOpen" class="fixed inset-0 z-[9999] md:hidden">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          aria-hidden="true"
          @click="closeMenu(true)"
        />

        <!-- Drawer -->
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
            class="absolute inset-y-0 end-0 flex w-[min(20rem,85vw)] flex-col overflow-y-auto border-s border-gray-200 bg-white px-5 pb-8 pt-5 shadow-2xl"
          >
            <div class="flex items-center justify-between gap-4">
              <p class="text-base font-semibold text-gray-900">
                {{ t('app.name') }}
              </p>

              <button
                ref="closeButton"
                type="button"
                class="inline-flex size-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                :aria-label="t('nav.closeMenu')"
                @click="closeMenu(true)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="size-5"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav class="mt-8 flex flex-col" :aria-label="t('nav.primary')">
              <NuxtLink
                v-for="item in links"
                :key="item.path"
                :to="item.path"
                :aria-current="isActive(item.path) ? 'page' : undefined"
                class="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-gray-100"
                :class="
                  isActive(item.path) ? 'text-brand-700' : 'text-gray-700 hover:text-brand-600'
                "
                @click="closeMenu()"
              >
                {{ t(item.labelKey) }}
              </NuxtLink>
            </nav>

            <div class="mt-auto flex flex-col gap-4 pt-6">
              <NuxtLink v-if="showsOrderCta" to="/kiosk" class="w-full" @click="closeMenu()">
                <BaseButton size="sm" block>
                  {{ t('landing.cta.order') }}
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
