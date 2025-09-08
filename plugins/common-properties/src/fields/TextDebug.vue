<script setup lang="ts">
  import type { PropertyField } from '@craftile/types';

  interface Props {
    field: PropertyField;
  }

  defineProps<Props>();

  const value = defineModel<string>();
</script>

<template>
  <input
    v-model="value"
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
    :placeholder="field.placeholder"
  />
</template>
