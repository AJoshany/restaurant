<script setup lang="ts">
import type { Order } from '#shared/schemas/order.schema'

const { t, locale } = useI18n()
const { products, pending, error, refresh } = useProducts()
const cart = useCart()

const confirmedOrder = ref<Order | null>(null)

function handleOrderPlaced(order: Order) {
  confirmedOrder.value = order
}

function handleNewOrder() {
  confirmedOrder.value = null
}

const showMobileCartBar = computed(
  () => !confirmedOrder.value && !pending.value && !error.value && cart.itemCount.value > 0
)
</script>

<template>
  <main class="mx-auto max-w-screen-xl p-4 sm:p-6">
    <KioskOrderConfirmation
      v-if="confirmedOrder"
      :order="confirmedOrder"
      @new-order="handleNewOrder"
    />

    <template v-else>
      <div class="text-center sm:text-start">
        <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ t('kiosk.title') }}</h1>
        <p class="mt-1 text-sm text-gray-600">{{ t('kiosk.subtitle') }}</p>
      </div>

      <div v-if="pending" class="flex justify-center py-16">
        <BaseSpinner size="lg" :label="t('common.loading')" />
      </div>

      <BaseEmptyState
        v-else-if="error"
        class="py-16"
        :title="t('kiosk.loadError.title')"
        :description="t('kiosk.loadError.description')"
      >
        <template #actions>
          <BaseButton size="sm" @click="refresh()">{{ t('common.retry') }}</BaseButton>
        </template>
      </BaseEmptyState>

      <div v-else class="mt-6 grid gap-6 pb-20 lg:grid-cols-[1fr_380px] lg:items-start lg:pb-0">
        <KioskProductGrid :products="products" />
        <KioskCartPanel @placed="handleOrderPlaced" />
      </div>
    </template>

    <a
      v-if="showMobileCartBar"
      href="#kiosk-cart"
      class="fixed inset-x-4 bottom-4 z-10 flex items-center justify-between rounded-lg bg-brand-600 px-4 py-3 text-white shadow-lg lg:hidden"
    >
      <span class="text-sm font-medium">
        {{ t('kiosk.cart.itemsCount', { count: cart.itemCount.value }) }}
      </span>
      <span class="text-sm font-semibold">
        {{ formatCurrencyAmount(cart.subtotal.value, locale) }} {{ t('kiosk.currencyUnit') }}
      </span>
    </a>
  </main>
</template>
