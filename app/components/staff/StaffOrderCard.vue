<script setup lang="ts">
import { getNextOrderStatus } from '#shared/domain/order-status'
import type { Order } from '#shared/schemas/order.schema'

interface Props {
  order: Order
  pending?: boolean
  hasError?: boolean
  syncing?: boolean
}

interface Emits {
  advance: []
}

const { order, pending = false, hasError = false, syncing = false } = defineProps<Props>()
defineEmits<Emits>()

const { t, locale } = useI18n()

const nextStatus = computed(() => getNextOrderStatus(order.status))
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-lg font-semibold text-gray-900">{{ order.orderNumber }}</p>
          <p class="text-sm text-gray-500">
            {{ t('staff.order.createdAtLabel') }} {{ formatDateTime(order.createdAt, locale) }}
          </p>
        </div>
        <OrderStatusBadge :status="order.status" :syncing="syncing" />
      </div>
    </template>

    <ul class="divide-y divide-gray-100">
      <li
        v-for="item in order.items"
        :key="item.productId"
        class="flex items-center justify-between py-2 text-sm"
      >
        <span class="text-gray-700">
          {{ getLocalizedText(item.productName, locale) }} × {{ item.quantity }}
        </span>
        <span class="text-gray-900">
          {{ formatCurrencyAmount(item.subtotal, locale) }} {{ t('common.currencyUnit') }}
        </span>
      </li>
    </ul>

    <template #footer>
      <div class="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
        <span class="font-semibold text-gray-900">
          {{ t('staff.order.totalLabel') }}: {{ formatCurrencyAmount(order.totalAmount, locale) }}
          {{ t('common.currencyUnit') }}
        </span>

        <BaseButton
          v-if="nextStatus"
          size="sm"
          :loading="pending"
          :disabled="pending"
          @click="$emit('advance')"
        >
          {{ t('staff.order.markAs', { status: t(`order.status.${nextStatus}`) }) }}
        </BaseButton>
      </div>

      <p v-if="hasError" role="alert" class="mt-2 text-sm text-danger-600">
        {{ t('staff.order.updateError') }}
      </p>
    </template>
  </BaseCard>
</template>
