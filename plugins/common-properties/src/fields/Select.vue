<script setup lang="ts">
import { createListCollection, Select } from '@ark-ui/vue/select';
import { computed } from 'vue';

interface PropertyFieldOption {
  value: any;
  label?: string;
}

interface PropertyField {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  variant?: 'select' | 'segment';
  options?: PropertyFieldOption[];
}

interface Props {
  field: PropertyField;
}

const props = defineProps<Props>();
const value = defineModel<any>();
const variant = computed(() => props.field.variant || 'select');

const selectItems = computed(() =>
  createListCollection({
    items:
      props.field.options?.map((option) => ({
        label: option.label || option.value,
        value: option.value,
      })) || [],
  })
);

// Handle single value selection for Select component
const selectedValues = computed({
  get: () => (value.value ? [value.value] : []),
  set: (newValues: any[]) => {
    value.value = newValues[0] || null;
  },
});
</script>

<template>
  <!-- Segment Group variant -->
  <div v-if="variant === 'segment'" class="flex rounded-lg border border-gray-300 bg-gray-100 relative p-0.5">
    <button
      v-for="option in field.options"
      class="flex-1 h-9 text-center cursor-pointer rounded text-sm data-[state=checked]:bg-white data-[state=checked]:shadow"
      :data-state="value === option.value ? 'checked' : 'unchecked'"
      @click="value = option.value"
    >
      {{ option.label || option.value }}
    </button>
  </div>

  <!-- Select dropdown variant -->
  <Select.Root v-else v-model="selectedValues" :collection="selectItems" :positioning="{ gutter: 2 }">
    <Select.Label class="block text-sm font-medium text-gray-700 mb-1">
      {{ field.label }}
    </Select.Label>
    <Select.Control class="w-full">
      <Select.Trigger
        class="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      >
        <Select.ValueText class="text-sm text-gray-900" :placeholder="field.placeholder || 'Select an option...'" />
        <Select.Indicator class="ml-2">
          <icon-chevron-down class="w-4 h-4 text-gray-400" />
        </Select.Indicator>
      </Select.Trigger>
    </Select.Control>

    <Select.Positioner class="w-[var(--reference-width)]">
      <Select.Content class="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-50">
        <Select.Item
          v-for="item in selectItems.items"
          :key="item.value"
          :item="item"
          class="flex items-center px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer data-[state=checked]:bg-accent-foreground data-[state=checked]:text-accent"
        >
          <Select.ItemText>{{ item.label }}</Select.ItemText>
          <Select.ItemIndicator class="ml-auto">
            <icon-check class="w-4 h-4 text-accent" />
          </Select.ItemIndicator>
        </Select.Item>
      </Select.Content>
    </Select.Positioner>
  </Select.Root>
</template>
