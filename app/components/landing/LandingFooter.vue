<script setup lang="ts">
const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-ink-950/15 bg-cream-50 text-ink-950">
    <div
      class="mx-auto grid max-w-screen-xl gap-10 px-5 pb-9 pt-12 sm:px-8 lg:grid-cols-[1.6fr_1fr_auto] lg:gap-16 lg:pt-16"
    >
      <div>
        <p
          class="font-editorial text-4xl leading-none font-semibold tracking-tight rtl:font-sans rtl:text-3xl"
        >
          {{ t('app.name') }}
        </p>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-ink-950/65">
          {{ t('landing.footer.tagline') }}
        </p>
      </div>

      <div>
        <p
          class="text-[0.65rem] font-semibold tracking-[0.16em] text-tomato-700 uppercase rtl:tracking-normal"
        >
          {{ t('landing.nav.visit') }}
        </p>
        <p class="mt-4 text-sm leading-relaxed text-ink-950/80">
          {{ t('landing.closing.hours') }}
        </p>
        <p class="mt-1 text-sm leading-relaxed text-ink-950/80">
          {{ t('landing.closing.address') }}
        </p>
      </div>

      <div class="flex flex-col items-start gap-5 lg:items-end">
        <LocaleSwitcher variant="editorial" />
        <a
          href="#home"
          class="text-[0.65rem] font-semibold tracking-[0.16em] text-ink-950/70 uppercase transition-colors hover:text-tomato-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tomato-700 rtl:tracking-normal"
        >
          {{ t('landing.nav.home') }}
        </a>
      </div>
    </div>

    <div class="border-t border-ink-950/15">
      <div class="mx-auto max-w-screen-xl px-5 py-5 text-xs text-ink-950/55 sm:px-8">
        {{ t('landing.footer.rights', { year: currentYear, appName: t('app.name') }) }}
      </div>
    </div>
  </footer>
</template>
