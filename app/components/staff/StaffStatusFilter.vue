<script setup lang="ts">
import { ORDER_STATUSES } from '#shared/domain/order-status'
import type { OrderStatus } from '#shared/domain/order-status'
import type { OrderStatusFilter } from '~/types/order-filter'

interface Props {
  modelValue: OrderStatusFilter
  counts: Record<OrderStatus, number>
}

interface Emits {
  'update:modelValue': [value: OrderStatusFilter]
}

const { counts } = defineProps<Props>()
defineEmits<Emits>()

const { t, locale } = useI18n()

const totalCount = computed(() => Object.values(counts).reduce((sum, count) => sum + count, 0))

const tabs = computed(() => [
  { value: 'all' as const, label: t('staff.filter.all'), count: totalCount.value },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: t(`order.status.${status}`),
    count: counts[status]
  }))
])
</script>

<template>
  <div class="flex flex-wrap gap-2" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
      :class="
        modelValue === tab.value
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      "
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
      <span
        class="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs"
        :class="modelValue === tab.value ? 'bg-white/20' : 'bg-gray-100'"
      >
        {{ tab.count.toLocaleString(locale) }}
      </span>
    </button>
  </div>
</template>
