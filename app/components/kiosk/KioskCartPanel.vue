<script setup lang="ts">
import type { Order } from '#shared/schemas/order.schema'

interface Props {
  /** On the desktop layout the cart already sits in the side column, so the
   *  bottom-sheet toggle should stay hidden there. */
  mobileSheet?: boolean
}

withDefaults(defineProps<Props>(), {
  mobileSheet: false
})

interface Emits {
  placed: [order: Order]
}

const emit = defineEmits<Emits>()

const { t, locale } = useI18n()
const cart = useCart()
const { pending, error, submit } = useCreateOrder()

const isEmpty = computed(() => cart.items.value.length === 0)
const isExpanded = ref(false)

onMounted(() => {
  window.addEventListener('kiosk:open-cart-sheet', (event: Event) => {
    const detail = (event as CustomEvent<{ open: boolean }>).detail
    isExpanded.value = detail.open
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('kiosk:open-cart-sheet', () => {})
})

async function handlePlaceOrder() {
  const order = await submit(
    cart.items.value.map((item) => ({ productId: item.productId, quantity: item.quantity }))
  )

  if (order) {
    cart.clear()
    isExpanded.value = false
    emit('placed', order)
  }
}

function closeSheet() {
  isExpanded.value = false
}
</script>

<template>
  <!-- Mobile bottom sheet -->
  <Teleport to="body">
    <Transition
      v-if="mobileSheet"
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      appear
    >
      <div v-if="isExpanded" class="fixed inset-0 z-40 lg:hidden" @click.self="closeSheet">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" aria-hidden="true" />

        <div
          role="dialog"
          aria-modal="true"
          :aria-label="t('kiosk.cart.title')"
          class="absolute bottom-0 inset-x-0 rounded-t-2xl bg-white pb-6 pt-4 shadow-2xl ring-1 ring-gray-200/70 max-h-[70vh] overflow-y-auto"
        >
          <div class="mx-auto mb-3 flex h-1.5 w-8 items-center justify-center gap-1">
            <span class="h-1 w-1.5 rounded-full bg-gray-300" />
            <span class="h-1 w-1.5 rounded-full bg-gray-300" />
            <span class="h-1 w-1.5 rounded-full bg-gray-300" />
          </div>

          <div class="flex items-center justify-between px-5">
            <h2 class="text-lg font-semibold text-gray-900">{{ t('kiosk.cart.title') }}</h2>
            <p class="text-sm font-semibold text-gray-900">
              {{ formatCurrencyAmount(cart.subtotal.value, locale) }} {{ t('common.currencyUnit') }}
            </p>
          </div>

          <div v-if="isEmpty" class="px-5 pt-2">
            <BaseEmptyState
              :title="t('kiosk.cart.empty.title')"
              :description="t('kiosk.cart.empty.description')"
            />
          </div>

          <div v-else class="px-5">
            <div class="flex flex-col divide-y divide-gray-100">
              <KioskCartItemRow
                v-for="item in cart.items.value"
                :key="item.productId"
                :item="item"
                @increment="cart.increment(item.productId)"
                @decrement="cart.decrement(item.productId)"
                @remove="cart.remove(item.productId)"
              />
            </div>

            <p v-if="error" role="alert" class="mt-3 text-sm text-danger-600">
              {{ t('kiosk.cart.submitError') }}
            </p>

            <BaseButton
              size="lg"
              block
              class="mt-4"
              :loading="pending"
              :disabled="pending"
              @click="handlePlaceOrder"
            >
              {{ t('kiosk.cart.placeOrder') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Desktop / in-flow cart card -->
  <BaseCard class="scroll-mt-16">
    <template #header>
      <h2 class="text-lg font-semibold text-gray-900">{{ t('kiosk.cart.title') }}</h2>
    </template>

    <BaseEmptyState
      v-if="isEmpty"
      :title="t('kiosk.cart.empty.title')"
      :description="t('kiosk.cart.empty.description')"
    />

    <div v-else class="flex flex-col">
      <div class="divide-y divide-gray-100">
        <KioskCartItemRow
          v-for="item in cart.items.value"
          :key="item.productId"
          :item="item"
          @increment="cart.increment(item.productId)"
          @decrement="cart.decrement(item.productId)"
          @remove="cart.remove(item.productId)"
        />
      </div>

      <div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <span class="text-base font-semibold text-gray-900">{{ t('kiosk.cart.total') }}</span>
        <span class="text-base font-semibold text-gray-900">
          {{ formatCurrencyAmount(cart.subtotal.value, locale) }} {{ t('common.currencyUnit') }}
        </span>
      </div>

      <p v-if="error" role="alert" class="mt-3 text-sm text-danger-600">
        {{ t('kiosk.cart.submitError') }}
      </p>

      <BaseButton
        size="lg"
        block
        class="mt-4"
        :loading="pending"
        :disabled="pending"
        @click="handlePlaceOrder"
      >
        {{ t('kiosk.cart.placeOrder') }}
      </BaseButton>
    </div>
  </BaseCard>
</template>
