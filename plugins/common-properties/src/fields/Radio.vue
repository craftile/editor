<script setup lang="ts">
  import { RadioGroup } from '@ark-ui/vue/radio-group';
  import type { PropertyField } from '@craftile/types';

  // interface PropertyFieldOption {
  //   value: any;
  //   label?: string;
  // }

  interface Props {
    field: PropertyField;
  }

  defineProps<Props>();

  const value = defineModel<any>();
</script>

<template>
  <RadioGroup.Root
    v-model="value"
    class="relative gap-1 flex flex-col"
  >
    <RadioGroup.Label class="text-sm font-medium text-gray-700 ">
      {{ field.label }}
    </RadioGroup.Label>

    <RadioGroup.Item
      v-for="option in field.options"
      :key="option.value"
      :value="option.value"
      class="flex items-center gap-2 cursor-pointer"
    >
      <RadioGroup.Indicator />
      <RadioGroup.ItemControl
        class="w-4 h-4 border border-gray-300 rounded-full data-[state=checked]:border-accent data-[state=checked]:outline-accent data-[state=checked]:outline-4 data-[state=checked]:-outline-offset-8"
      />
      <RadioGroup.ItemText class="text-sm text-gray-700">
        {{ option.label || option.value }}
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</template>
