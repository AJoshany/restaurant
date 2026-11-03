<script setup lang="ts">
const { t } = useI18n()
const { target: imageTarget, isVisible: imageVisible } = useScrollReveal({ threshold: 0 })
</script>

<template>
  <section class="mx-auto max-w-screen-xl px-6 py-12 sm:py-16 lg:py-20">
    <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="flex flex-col items-start gap-5 text-start">
        <BaseBadge variant="brand">{{ t('landing.hero.eyebrow') }}</BaseBadge>

        <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl lg:text-4xl">
          {{ t('landing.hero.title') }}
        </h1>

        <p class="max-w-prose text-base text-gray-600">
          {{ t('landing.hero.subtitle', { appName: t('app.name') }) }}
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <NuxtLink to="/kiosk">
            <BaseButton size="lg">{{ t('landing.hero.ctaPrimary') }}</BaseButton>
          </NuxtLink>
          <a
            href="#story"
            class="inline-flex h-12 items-center justify-center rounded-md px-6 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            {{ t('landing.hero.ctaSecondary') }}
          </a>
        </div>
      </div>

      <div
        ref="imageTarget"
        class="transition-all duration-700 ease-out motion-reduce:transition-none"
        :class="imageVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <img
          src="/images/landing/hero.svg"
          :alt="t('landing.hero.imageAlt')"
          class="aspect-[4/3] w-full rounded-xl object-cover shadow-lg"
          width="800"
          height="600"
        />
      </div>
    </div>
  </section>
</template>
