<script setup lang="ts">
import type { Product } from '#shared/schemas/product.schema'

interface Props {
  products: Product[]
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <BaseEmptyState
    v-if="products.length === 0"
    :title="t('kiosk.empty.title')"
    :description="t('kiosk.empty.description')"
  />

  <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
    <KioskProductCard v-for="product in products" :key="product.id" :product="product" />
  </div>
</template>
