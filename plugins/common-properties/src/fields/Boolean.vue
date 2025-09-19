<script setup lang="ts">
import { computed } from 'vue';
import type { PropertyField } from '@craftile/types';
import { Checkbox } from '@ark-ui/vue/checkbox';
import { Switch } from '@ark-ui/vue/switch';

interface Props {
  field: PropertyField;
}

const props = defineProps<Props>();
const variant = computed(() => props.field.variant || 'checkbox');

const checked = defineModel<boolean>();
</script>

<template>
  <!-- Switch variant -->
  <Switch.Root v-if="variant === 'switch'" v-model:checked="checked" class="flex items-center cursor-pointer gap-2">
    <Switch.Control
      class="w-8 h-4 p-0.5 inline-flex items-center bg-gray-300 rounded-full data-[state=checked]:bg-accent relative transition-colors"
    >
      <Switch.Thumb
        class="w-3 h-3 bg-white rounded-full shadow-sm data-[state=checked]:translate-x-4 transition-transform"
      />
    </Switch.Control>
    <Switch.Label class="text-sm font-medium text-gray-700">
      {{ field.label }}
    </Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>

  <!-- Checkbox variant -->
  <Checkbox.Root v-else v-model:checked="checked" class="flex items-center cursor-pointer gap-2">
    <Checkbox.Control
      class="w-4 h-4 border border-gray-300 rounded data-[state=checked]:bg-accent data-[state=checked]:border-accent flex items-center justify-center"
    >
      <Checkbox.Indicator>
        <icon-check class="w-3 h-3 text-white" />
      </Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>{{ field.label }}</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</template>
