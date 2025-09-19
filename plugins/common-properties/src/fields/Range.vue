<script setup lang="ts">
import { computed } from 'vue';
import { Field } from '@ark-ui/vue/field';
import { Slider } from '@ark-ui/vue/slider';
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

      <Field.Root
        class="flex flex-none items-center w-16 px-2 h-8 rounded border border-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-accent"
      >
        <Field.Input
          class="w-full text-sm outline-none appearance-none"
          type="number"
          v-model="value"
          :min="min"
          :max="max"
          :step="step"
        />
        <div v-if="field.unit" class="text-sm text-gray-500">{{ field.unit }}</div>
      </Field.Root>
    </div>
  </Slider.Root>
</template>
