<script setup lang="ts">
import { getNextOrderStatus } from '#shared/domain/order-status'
import type { OrderStatusFilter } from '~/types/order-filter'

const { t } = useI18n()
const { orders, pending, error, refresh, applyUpdatedOrder } = useOrders()
const { pendingOrderIds, errorOrderIds, updateStatus } = useUpdateOrderStatus()

const statusFilter = ref<OrderStatusFilter>('all')

const counts = computed(() => countOrdersByStatus(orders.value))
const filteredOrders = computed(() => filterOrdersByStatus(orders.value, statusFilter.value))

async function handleAdvance(orderId: string) {
  const order = orders.value.find((candidate) => candidate.id === orderId)
  if (!order) {
    return
  }

  const nextStatus = getNextOrderStatus(order.status)
  if (!nextStatus) {
    return
  }

  const updated = await updateStatus(orderId, nextStatus)
  if (updated) {
    applyUpdatedOrder(updated)
  }
}
</script>

<template>
  <main class="mx-auto max-w-screen-xl p-4 sm:p-6">
    <div class="text-center sm:text-start">
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ t('staff.title') }}</h1>
      <p class="mt-1 text-sm text-gray-600">{{ t('staff.subtitle') }}</p>
    </div>

    <div v-if="pending" class="flex justify-center py-16">
      <BaseSpinner size="lg" :label="t('common.loading')" />
    </div>

    <BaseEmptyState
      v-else-if="error"
      class="py-16"
      :title="t('staff.loadError.title')"
      :description="t('staff.loadError.description')"
    >
      <template #actions>
        <BaseButton size="sm" @click="refresh()">{{ t('common.retry') }}</BaseButton>
      </template>
    </BaseEmptyState>

    <template v-else>
      <StaffStatusFilter v-model="statusFilter" :counts="counts" class="mt-6" />

      <StaffOrderList
        class="mt-4"
        :orders="filteredOrders"
        :pending-order-ids="pendingOrderIds"
        :error-order-ids="errorOrderIds"
        @advance="handleAdvance"
      />
    </template>
  </main>
</template>
