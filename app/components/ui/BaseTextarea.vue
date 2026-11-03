<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  name?: string
  rows?: number
}

const {
  modelValue = undefined,
  label = undefined,
  hint = undefined,
  error = undefined,
  required = false,
  disabled = false,
  placeholder = undefined,
  name = undefined,
  rows = 4
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <BaseFormField
    v-slot="{ id, describedBy, invalid }"
    :label="label"
    :hint="hint"
    :error="error"
    :required="required"
  >
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :name="name"
      :rows="rows"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      class="w-full resize-y rounded-md border bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      :class="
        invalid ? 'border-danger-500 focus:ring-danger-500' : 'border-gray-300 focus:ring-brand-500'
      "
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </BaseFormField>
</template>
