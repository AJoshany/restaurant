<script setup lang="ts">
import type { OrderStatus } from '#shared/domain/order-status'

interface Props {
  status: OrderStatus
  /** The status may be out of date; show a loading state instead of it. */
  syncing?: boolean
}

const { status, syncing = false } = defineProps<Props>()

const { t } = useI18n()

const variant = computed(() => (syncing ? 'neutral' : getOrderStatusBadgeVariant(status)))
</script>

<template>
  <BaseBadge :variant="variant" :aria-busy="syncing">
    <template v-if="syncing">
      <BaseSpinner size="sm" class="me-1.5" />
      {{ t('common.loading') }}
    </template>
    <template v-else>{{ t(`order.status.${status}`) }}</template>
  </BaseBadge>
</template>
