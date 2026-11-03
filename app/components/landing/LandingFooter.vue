<script setup lang="ts">
const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-cream-100/10 bg-ink-950">
    <div
      class="mx-auto flex max-w-screen-xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8"
    >
      <div>
        <p class="text-base font-semibold text-cream-50">{{ t('app.name') }}</p>
        <p class="mt-1 text-sm text-cream-200/55">{{ t('landing.footer.tagline') }}</p>
      </div>

      <div class="flex flex-col items-start gap-4 sm:items-end">
        <LocaleSwitcher variant="dark" />
        <p class="text-xs text-cream-200/40">
          {{ t('landing.footer.rights', { year: currentYear, appName: t('app.name') }) }}
        </p>
      </div>
    </div>
  </footer>
</template>
