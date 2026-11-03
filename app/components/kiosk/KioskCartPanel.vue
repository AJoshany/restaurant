<script setup lang="ts">
import type { Order } from '#shared/schemas/order.schema'

interface Emits {
  placed: [order: Order]
}

const emit = defineEmits<Emits>()

const { t, locale } = useI18n()
const cart = useCart()
const { pending, error, submit } = useCreateOrder()

const isEmpty = computed(() => cart.items.value.length === 0)

async function handlePlaceOrder() {
  const order = await submit(
    cart.items.value.map((item) => ({ productId: item.productId, quantity: item.quantity }))
  )

  if (order) {
    cart.clear()
    emit('placed', order)
  }
}
</script>

<template>
  <BaseCard id="kiosk-cart">
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
