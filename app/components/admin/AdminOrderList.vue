<script setup lang="ts">
import type { Order } from '#shared/schemas/order.schema'

interface Props {
  orders: Order[]
}

const { orders } = defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <BaseEmptyState
    v-if="orders.length === 0"
    :title="t('admin.empty.title')"
    :description="t('admin.empty.description')"
  />

  <div v-else class="grid gap-4">
    <AdminOrderCard v-for="order in orders" :key="order.id" :order="order" />
  </div>
</template>
