<script setup lang="ts">
import type { PropertyField } from '@craftile/types';
import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';

interface Props {
  field: PropertyField;
  modelValue: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const { propertyFields: propertyFieldConfigs } = useUI();

const fieldRenderer = computed(() => {
  const config = propertyFieldConfigs.value.get(props.field.type);
  return config?.render;
});

const handleInput = (value: any) => {
  emit('update:modelValue', value);
};
</script>
<template>
  <div>
    <!-- Vue Component Rendering -->
    <component
      v-if="isVueComponent(fieldRenderer) || isComponentString(fieldRenderer)"
      :is="fieldRenderer"
      :field="field"
      :model-value="modelValue"
      @update:model-value="handleInput"
    />

    <!-- Framework-Agnostic Render Function -->
    <PropertyFieldRenderWrapper
      v-else-if="isHtmlRenderFunction(fieldRenderer)"
      :render-fn="fieldRenderer"
      :field="field"
      :value="modelValue"
      :on-change="handleInput"
    />

    <div v-else class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <p class="text-sm text-red-600">
        Unknown field type: <code class="font-mono">{{ field.type }}</code>
      </p>
    </div>
  </div>
</template>
