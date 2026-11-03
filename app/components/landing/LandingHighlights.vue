<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-screen-xl px-6 py-12 sm:py-16 lg:py-20">
    <h2 class="text-center text-xl font-semibold text-gray-900 sm:text-2xl">
      {{ t('landing.highlights.title') }}
    </h2>

    <div class="mt-10 grid gap-6 sm:grid-cols-3">
      <BaseCard>
        <div
          class="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13c0-5 4-9 9-9h5v5c0 5-4 9-9 9H5v-5Z"
            />
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 18 13 10" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-semibold text-gray-900">
          {{ t('landing.highlights.fresh.title') }}
        </h3>
        <p class="mt-2 text-sm text-gray-600">{{ t('landing.highlights.fresh.description') }}</p>
      </BaseCard>

      <BaseCard>
        <div
          class="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="size-6"
          >
            <circle cx="12" cy="12" r="9" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l4 2" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-semibold text-gray-900">
          {{ t('landing.highlights.fast.title') }}
        </h3>
        <p class="mt-2 text-sm text-gray-600">{{ t('landing.highlights.fast.description') }}</p>
      </BaseCard>

      <BaseCard>
        <div
          class="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3c2 3-1 4-1 7a3 3 0 0 0 6 0c0-1-.3-2-1-3 1.5 1 3 3.3 3 6a7 7 0 0 1-14 0c0-4 3-6 4-7 1-1 1.5-2 3-3Z"
            />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-semibold text-gray-900">
          {{ t('landing.highlights.authentic.title') }}
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('landing.highlights.authentic.description') }}
        </p>
      </BaseCard>
    </div>
  </section>
</template>
