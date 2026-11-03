<script setup lang="ts">
import type { OrderStatusFilter } from '~/types/order-filter'
import type { OrderSortOption } from '~/types/order-sort'

const { t } = useI18n()
const { orders, pending, error, refresh } = useOrders()

const statusFilter = ref<OrderStatusFilter>('all')
const sortOption = ref<OrderSortOption>('newest')

const counts = computed(() => countOrdersByStatus(orders.value))
const filteredOrders = computed(() => filterOrdersByStatus(orders.value, statusFilter.value))
const sortedOrders = computed(() => sortOrders(filteredOrders.value, sortOption.value))
</script>

<template>
  <main class="mx-auto max-w-screen-xl p-4 sm:p-6">
    <div class="text-center sm:text-start">
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ t('admin.title') }}</h1>
      <p class="mt-1 text-sm text-gray-600">{{ t('admin.subtitle') }}</p>
    </div>

    <div v-if="pending" class="flex justify-center py-16">
      <BaseSpinner size="lg" :label="t('common.loading')" />
    </div>

    <BaseEmptyState
      v-else-if="error"
      class="py-16"
      :title="t('admin.loadError.title')"
      :description="t('admin.loadError.description')"
    >
      <template #actions>
        <BaseButton size="sm" @click="refresh()">{{ t('common.retry') }}</BaseButton>
      </template>
    </BaseEmptyState>

    <template v-else>
      <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <OrderStatusTabs
          v-model="statusFilter"
          :counts="counts"
          :all-label="t('admin.filter.all')"
        />

        <BaseFormField v-slot="{ id, describedBy }" :label="t('admin.sort.label')" class="sm:w-56">
          <select
            :id="id"
            v-model="sortOption"
            :aria-describedby="describedBy"
            class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option v-for="option in ORDER_SORT_OPTIONS" :key="option" :value="option">
              {{ t(`admin.sort.${option}`) }}
            </option>
          </select>
        </BaseFormField>
      </div>

      <AdminOrderList class="mt-4" :orders="sortedOrders" />
    </template>
  </main>
</template>
