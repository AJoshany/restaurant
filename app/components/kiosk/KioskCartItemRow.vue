<script setup lang="ts">
import type { CartItem } from '~/types/cart'

interface Props {
  item: CartItem
}

interface Emits {
  increment: []
  decrement: []
  remove: []
}

const { item } = defineProps<Props>()
defineEmits<Emits>()

const { t, locale } = useI18n()

const localizedName = computed(() => getLocalizedText(item.name, locale.value))
const subtotal = computed(() => item.unitPrice * item.quantity)
</script>

<template>
  <div class="flex items-start gap-3 py-3">
    <img
      :src="item.image"
      :alt="localizedName"
      class="size-14 shrink-0 rounded-md object-cover"
      width="56"
      height="56"
    />

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm font-medium break-words text-gray-900">{{ localizedName }}</p>
          <p class="mt-0.5 text-sm text-gray-500">
            {{ formatCurrencyAmount(subtotal, locale) }} {{ t('common.currencyUnit') }}
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 text-sm text-danger-600 hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500"
          :aria-label="t('kiosk.cart.removeItem')"
          @click="$emit('remove')"
        >
          {{ t('kiosk.cart.remove') }}
        </button>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          :aria-label="t('kiosk.cart.decreaseQuantity')"
          @click="$emit('decrement')"
        >
          −
        </button>
        <span class="w-8 text-center text-sm font-medium tabular-nums text-gray-900">
          {{ item.quantity }}
        </span>
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          :aria-label="t('kiosk.cart.increaseQuantity')"
          @click="$emit('increment')"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>
