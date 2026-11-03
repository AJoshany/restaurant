<script setup lang="ts">
import type { Order } from '#shared/schemas/order.schema'

interface Props {
  order: Order
}

interface Emits {
  newOrder: []
}

const { order } = defineProps<Props>()
defineEmits<Emits>()

const { t, locale } = useI18n()
</script>

<template>
  <BaseCard class="mx-auto max-w-screen-sm text-center">
    <div class="flex flex-col items-center gap-2 py-4">
      <BaseBadge variant="success" size="md">{{ t('kiosk.confirmation.title') }}</BaseBadge>

      <p class="text-sm text-gray-500">{{ t('kiosk.confirmation.orderNumberLabel') }}</p>
      <p class="text-3xl font-semibold tracking-wide text-gray-900">{{ order.orderNumber }}</p>

      <p class="mt-2 text-sm text-gray-600">{{ t('kiosk.confirmation.message') }}</p>

      <ul class="mt-4 w-full divide-y divide-gray-100 text-start">
        <li
          v-for="item in order.items"
          :key="item.productId"
          class="flex items-center justify-between py-2 text-sm"
        >
          <span class="text-gray-700"
            >{{ getLocalizedText(item.productName, locale) }} × {{ item.quantity }}</span
          >
          <span class="text-gray-900"
            >{{ formatCurrencyAmount(item.subtotal, locale) }} {{ t('kiosk.currencyUnit') }}</span
          >
        </li>
      </ul>

      <div class="mt-2 flex w-full items-center justify-between border-t border-gray-200 pt-3">
        <span class="font-semibold text-gray-900">{{ t('kiosk.cart.total') }}</span>
        <span class="font-semibold text-gray-900">
          {{ formatCurrencyAmount(order.totalAmount, locale) }} {{ t('kiosk.currencyUnit') }}
        </span>
      </div>

      <BaseButton size="lg" class="mt-6" @click="$emit('newOrder')">
        {{ t('kiosk.confirmation.newOrder') }}
      </BaseButton>
    </div>
  </BaseCard>
</template>
