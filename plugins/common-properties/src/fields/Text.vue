<script setup lang="ts">
import type { PropertyField } from '@craftile/types';
import { Field } from '@ark-ui/vue/field';

interface Props {
  field: PropertyField;
}

defineProps<Props>();

const value = defineModel<string>();
</script>

<template>
  <Field.Root>
    <Field.Label class="block text-sm font-medium text-gray-700 mb-1">
      {{ field.label }}
    </Field.Label>

    <Field.Input
      v-model="value"
      class="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      :placeholder="field.placeholder"
    />
  </Field.Root>
</template>
