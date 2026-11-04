<script setup lang="ts">
import type { Order } from '#shared/schemas/order.schema'

interface Props {
  order: Order
  syncing?: boolean
}

const { order, syncing = false } = defineProps<Props>()

const { t, locale } = useI18n()
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-lg font-semibold text-gray-900">{{ order.orderNumber }}</p>
          <p class="text-sm text-gray-500">
            {{ t('admin.order.createdAtLabel') }} {{ formatDateTime(order.createdAt, locale) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ t('admin.order.updatedAtLabel') }} {{ formatDateTime(order.updatedAt, locale) }}
          </p>
        </div>
        <OrderStatusBadge :status="order.status" :syncing="syncing" />
      </div>
    </template>

    <ul class="divide-y divide-gray-100">
      <li
        v-for="item in order.items"
        :key="item.productId"
        class="grid grid-cols-2 gap-y-1 py-2 text-sm sm:grid-cols-4 sm:items-center sm:gap-2"
      >
        <span class="col-span-2 text-gray-700 sm:col-span-1">
          {{ getLocalizedText(item.productName, locale) }}
        </span>
        <span class="text-gray-500">
          {{ t('admin.order.quantityLabel') }}: {{ item.quantity.toLocaleString(locale) }}
        </span>
        <span class="text-gray-500">
          {{ t('admin.order.unitPriceLabel') }}: {{ formatCurrencyAmount(item.unitPrice, locale) }}
          {{ t('common.currencyUnit') }}
        </span>
        <span class="text-end font-medium text-gray-900">
          {{ formatCurrencyAmount(item.subtotal, locale) }} {{ t('common.currencyUnit') }}
        </span>
      </li>
    </ul>

    <template #footer>
      <div class="flex items-center justify-between border-t border-gray-200 pt-4">
        <span class="font-semibold text-gray-900">
          {{ t('admin.order.totalLabel') }}: {{ formatCurrencyAmount(order.totalAmount, locale) }}
          {{ t('common.currencyUnit') }}
        </span>
      </div>
    </template>
  </BaseCard>
</template>
