<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search'
  placeholder?: string
  autocomplete?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const {
  modelValue = undefined,
  label = undefined,
  hint = undefined,
  error = undefined,
  required = false,
  disabled = false,
  type = 'text',
  placeholder = undefined,
  autocomplete = undefined,
  name = undefined,
  size = 'md'
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-8 px-2.5 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base'
}
</script>

<template>
  <BaseFormField
    v-slot="{ id, describedBy, invalid }"
    :label="label"
    :hint="hint"
    :error="error"
    :required="required"
  >
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :name="name"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      class="w-full rounded-md border bg-white text-gray-900 transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      :class="[
        sizeClasses[size],
        invalid ? 'border-danger-500 focus:ring-danger-500' : 'border-gray-300 focus:ring-brand-500'
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </BaseFormField>
</template>
