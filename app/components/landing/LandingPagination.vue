<script setup lang="ts">
const { t } = useI18n()

const sections = [
  { id: 'home', labelKey: 'landing.pagination.first' },
  { id: 'story', labelKey: 'landing.pagination.second' },
  { id: 'visit', labelKey: 'landing.pagination.third' }
] as const

const activeSection = ref<(typeof sections)[number]['id']>('home')

let observer: IntersectionObserver | null = null

onMounted(async () => {
  await nextTick()

  // Watch a single line across the middle of the viewport: whichever
  // chapter crosses it is current. Unlike ratio thresholds, this works for
  // chapters of any height (the scroll-driven scene's are several screens).
  observer = new IntersectionObserver(
    (entries) => {
      const id = entries.find((entry) => entry.isIntersecting)?.target.id

      if (id === 'home' || id === 'story' || id === 'visit') {
        activeSection.value = id
      }
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  )

  sections.forEach(({ id }) => {
    const section = document.getElementById(id)
    if (section) observer?.observe(section)
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <nav
    class="fixed inset-y-0 end-5 z-30 hidden flex-col justify-center gap-3 md:flex xl:end-8"
    :aria-label="t('landing.pagination.label')"
  >
    <a
      v-for="section in sections"
      :key="section.id"
      :href="`#${section.id}`"
      :aria-label="t(section.labelKey)"
      :aria-current="activeSection === section.id ? 'location' : undefined"
      class="flex size-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato-700"
    >
      <span
        class="block size-1.5 rounded-full border border-tomato-700 transition-all duration-200"
        :class="activeSection === section.id ? 'bg-tomato-700 scale-125' : 'bg-cream-50'"
      />
    </a>
  </nav>
</template>
