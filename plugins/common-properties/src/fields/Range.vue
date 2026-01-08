<script setup lang="ts">
import { computed } from 'vue';
import { Slider } from '@ark-ui/vue/slider';
import { NumberInput } from '@ark-ui/vue/number-input';
import type { PropertyField } from '@craftile/types';

interface RangeField extends PropertyField {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface Props {
  field: RangeField;
}

const props = defineProps<Props>();
const min = computed(() => props.field.min || 0);
const max = computed(() => props.field.max || 100);
const step = computed(() => props.field.step || 1);

const value = defineModel<number>();

// Handle slider value as array
const sliderValue = computed({
  get: () => [value.value ?? props.field.default ?? props.field.min ?? 0],
  set: (newValues: number[]) => {
    value.value = newValues[0];
  },
});

// Ark UI NumberInput expects string values, so we need to convert
const stringValue = computed({
  get: () => {
    const currentValue = value.value ?? props.field.default ?? props.field.min ?? 0;
    return currentValue.toString();
  },
  set: (val: string) => {
    const num = parseFloat(val);
    value.value = isNaN(num) ? undefined : num;
  },
});
</script>

<template>
  <Slider.Root v-model="sliderValue" :min="min" :max="max" :step="step" class="relative w-full">
    <Slider.Label class="block text-sm font-medium text-gray-700 mb-1">
      {{ field.label }}
    </Slider.Label>

    <div class="flex items-center gap-4">
      <Slider.Control class="flex-1 flex items-center h-2 select-none touch-none">
        <Slider.Track class="flex-1 overflow-hidden h-1 rounded-full bg-gray-100">
          <Slider.Range class="h-1 bg-accent" />
        </Slider.Track>
        <Slider.Thumb
          :index="0"
          :key="0"
          class="h-4 w-4 bg-white rounded-full shadow outline-none border-2 border-accent"
        />
      </Slider.Control>

      <NumberInput.Root v-model="stringValue" :min="min" :max="max" :step="step" class="flex-none w-16">
        <NumberInput.Control
          class="flex items-center h-8 border border-gray-300 rounded overflow-hidden focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent"
        >
          <NumberInput.Input class="w-full px-2 text-sm focus:outline-none appearance-none" />
          <div v-if="field.unit" class="px-1 text-sm text-gray-500 border-gray-300">
            {{ field.unit }}
          </div>
        </NumberInput.Control>
      </NumberInput.Root>
    </div>
  </Slider.Root>
</template>
