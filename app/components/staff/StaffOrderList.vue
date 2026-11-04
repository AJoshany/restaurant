<script setup lang="ts">
import type { Order } from '#shared/schemas/order.schema'

interface Props {
  orders: Order[]
  pendingOrderIds: Set<string>
  errorOrderIds: Set<string>
  syncing?: boolean
}

interface Emits {
  advance: [orderId: string]
}

const { orders, syncing = false } = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()

const sortedOrders = computed(() =>
  [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
)
</script>

<template>
  <BaseEmptyState
    v-if="orders.length === 0"
    :title="t('staff.empty.title')"
    :description="t('staff.empty.description')"
  />

  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <StaffOrderCard
      v-for="order in sortedOrders"
      :key="order.id"
      :order="order"
      :pending="pendingOrderIds.has(order.id)"
      :has-error="errorOrderIds.has(order.id)"
      :syncing="syncing"
      @advance="$emit('advance', order.id)"
    />
  </div>
</template>
