<script setup lang="ts">
  import { Field } from '@ark-ui/vue/field';
  import type { PropertyField } from '@craftile/types';

  interface Props {
    field: PropertyField;
  }

  defineProps<Props>();

  const value = defineModel<string>();
</script>

<template>
  <Field.Root class="mb-4">
    <Field.Label class="block text-sm font-medium text-gray-700 mb-1">
      {{ field.label || field.id }}
    </Field.Label>

    <Field.Input
      v-model="value"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      :placeholder="field.placeholder"
    />
  </Field.Root>
</template>
