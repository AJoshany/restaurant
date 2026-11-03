<script setup lang="ts">
const { t } = useI18n()

const { target: saladTarget, isVisible: saladVisible } = useScrollReveal()
const { target: mainTarget, isVisible: mainVisible } = useScrollReveal()
const { target: dessertTarget, isVisible: dessertVisible } = useScrollReveal()
</script>

<template>
  <section class="mx-auto max-w-screen-xl px-6 py-12 sm:py-16 lg:py-20">
    <div class="text-center">
      <h2 class="text-xl font-semibold text-gray-900 sm:text-2xl">
        {{ t('landing.gallery.title') }}
      </h2>
      <p class="mt-2 text-sm text-gray-600">{{ t('landing.gallery.subtitle') }}</p>
    </div>

    <div class="mt-10 grid gap-6 sm:grid-cols-3">
      <div
        ref="saladTarget"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-700 ease-out motion-reduce:transition-none"
        :class="saladVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <img
          src="/images/landing/dish-salad.svg"
          :alt="t('landing.gallery.salad.imageAlt')"
          class="aspect-square w-full object-cover"
          width="400"
          height="400"
        />
        <div class="p-4">
          <h3 class="text-base font-semibold text-gray-900">
            {{ t('landing.gallery.salad.name') }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">{{ t('landing.gallery.salad.description') }}</p>
        </div>
      </div>

      <div
        ref="mainTarget"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all delay-100 duration-700 ease-out motion-reduce:transition-none motion-reduce:delay-0"
        :class="mainVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <img
          src="/images/landing/dish-main.svg"
          :alt="t('landing.gallery.main.imageAlt')"
          class="aspect-square w-full object-cover"
          width="400"
          height="400"
        />
        <div class="p-4">
          <h3 class="text-base font-semibold text-gray-900">
            {{ t('landing.gallery.main.name') }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">{{ t('landing.gallery.main.description') }}</p>
        </div>
      </div>

      <div
        ref="dessertTarget"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all delay-200 duration-700 ease-out motion-reduce:transition-none motion-reduce:delay-0"
        :class="dessertVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <img
          src="/images/landing/dish-dessert.svg"
          :alt="t('landing.gallery.dessert.imageAlt')"
          class="aspect-square w-full object-cover"
          width="400"
          height="400"
        />
        <div class="p-4">
          <h3 class="text-base font-semibold text-gray-900">
            {{ t('landing.gallery.dessert.name') }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">{{ t('landing.gallery.dessert.description') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
