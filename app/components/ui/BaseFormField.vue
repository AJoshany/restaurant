<script setup lang="ts">
interface Props {
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

const props = defineProps<Props>()

const fieldId = useId()
const hintId = computed(() => (props.hint ? `${fieldId}-hint` : undefined))
const errorId = computed(() => (props.error ? `${fieldId}-error` : undefined))
const describedBy = computed(
  () => [hintId.value, errorId.value].filter(Boolean).join(' ') || undefined
)
const invalid = computed(() => Boolean(props.error))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="fieldId" class="text-sm font-medium text-gray-900">
      {{ label }}
      <span v-if="required" class="text-danger-600" aria-hidden="true">*</span>
    </label>

    <slot :id="fieldId" :described-by="describedBy" :invalid="invalid" />

    <p v-if="hint && !error" :id="hintId" class="text-sm text-gray-500">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="text-sm text-danger-600" role="alert">{{ error }}</p>
  </div>
</template>
