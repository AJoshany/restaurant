<script setup lang="ts">
import type { Product } from '#shared/schemas/product.schema'

interface Props {
  product: Product
}

const { product } = defineProps<Props>()

const { t, locale } = useI18n()
const cart = useCart()

const quantityInCart = computed(() => cart.quantityFor(product.id))
const localizedName = computed(() => getLocalizedText(product.name, locale.value))
</script>

<template>
  <BaseCard padding="sm" class="flex flex-col gap-3">
    <div class="relative overflow-hidden rounded-md bg-gray-50">
      <img
        :src="product.image"
        :alt="localizedName"
        class="aspect-square w-full object-cover"
        width="300"
        height="300"
        loading="lazy"
      />
      <BaseBadge v-if="quantityInCart > 0" variant="brand" class="absolute end-2 top-2 shadow-sm">
        {{ quantityInCart }}
      </BaseBadge>
    </div>

    <div class="flex flex-1 flex-col gap-1">
      <h3 class="text-base font-semibold text-gray-900">{{ localizedName }}</h3>
      <p class="text-sm text-gray-600">
        {{ formatCurrencyAmount(product.price, locale) }} {{ t('common.currencyUnit') }}
      </p>
    </div>

    <BaseButton size="md" block @click="cart.add(product)">
      {{ t('kiosk.addToCart') }}
    </BaseButton>
  </BaseCard>
</template>
