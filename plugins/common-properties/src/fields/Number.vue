<script setup lang="ts">
import type { PropertyField } from '@craftile/types';
import { NumberInput } from '@ark-ui/vue/number-input';
import { computed } from 'vue';

interface NumberField extends PropertyField {
  min?: number;
  max?: number;
  step?: number;
}

interface Props {
  field: NumberField;
}

defineProps<Props>();

const numberValue = defineModel<number>();

// Ark UI NumberInput expects string values, so we need to convert
const stringValue = computed({
  get: () => numberValue.value?.toString() ?? '',
  set: (val: string) => {
    const num = parseFloat(val);
    numberValue.value = isNaN(num) ? undefined : num;
  },
});
</script>

<template>
  <NumberInput.Root v-model="stringValue" :min="field.min" :max="field.max" :step="field.step">
    <NumberInput.Label class="block text-sm font-medium text-gray-700 mb-1">
      {{ field.label }}
    </NumberInput.Label>

    <NumberInput.Control
      class="flex items-center h-9 border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent"
    >
      <NumberInput.Input class="flex-1 px-3 focus:outline-none" :placeholder="field.placeholder" />
      <div class="flex flex-col border-l border-gray-300">
        <NumberInput.IncrementTrigger class="px-2 py-1 hover:bg-gray-100 cursor-pointer">
          <icon-chevron-up class="w-3 h-3 text-gray-600" />
        </NumberInput.IncrementTrigger>
        <NumberInput.DecrementTrigger class="px-2 py-1 hover:bg-gray-100 cursor-pointer border-t border-gray-300">
          <icon-chevron-down class="w-3 h-3 text-gray-600" />
        </NumberInput.DecrementTrigger>
      </div>
    </NumberInput.Control>
  </NumberInput.Root>
</template>
