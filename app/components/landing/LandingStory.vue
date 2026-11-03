<script setup lang="ts">
const { t } = useI18n()
const { target: imageTarget, isVisible: imageVisible } = useScrollReveal()

const pointKeys = ['ingredients', 'recipes', 'hospitality'] as const
</script>

<template>
  <section id="story" class="mx-auto max-w-screen-xl px-6 py-12 sm:py-16 lg:py-20">
    <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div
        ref="imageTarget"
        class="order-last transition-all duration-700 ease-out motion-reduce:transition-none lg:order-first"
        :class="imageVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <img
          src="/images/landing/story.svg"
          :alt="t('landing.story.imageAlt')"
          class="aspect-[4/3] w-full rounded-xl object-cover shadow-lg"
          width="800"
          height="600"
        />
      </div>

      <div class="flex flex-col items-start gap-5 text-start">
        <h2 class="text-xl font-semibold text-gray-900 sm:text-2xl">
          {{ t('landing.story.title') }}
        </h2>
        <p class="max-w-prose text-base text-gray-600">
          {{ t('landing.story.body') }}
        </p>
        <ul class="flex flex-col gap-2">
          <li
            v-for="key in pointKeys"
            :key="key"
            class="flex items-center gap-3 text-sm text-gray-700"
          >
            <span class="size-2 shrink-0 rounded-full bg-success-500" />
            {{ t(`landing.story.points.${key}`) }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
