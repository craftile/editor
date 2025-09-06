<script setup lang="ts">
  import type { PropertyField } from '@craftile/types';
  import type { PropertyFieldConfig } from '../types/ui';
  import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';

  interface Props {
    field: PropertyField;
    renderer?: PropertyFieldConfig['render'];
    modelValue: any;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    'update:modelValue': [value: any];
  }>();

  const { t } = useI18n();

  const handleInput = (value: any) => {
    emit('update:modelValue', value);
  };
</script>
<template>
  <div>
    <!-- Vue Component Rendering -->
    <component
      v-if="isVueComponent(renderer) || isComponentString(renderer)"
      :is="renderer"
      :field="field"
      :model-value="modelValue"
      @update:model-value="handleInput"
    />

    <!-- Framework-Agnostic Render Function -->
    <PropertyFieldRenderWrapper
      v-else-if="isHtmlRenderFunction(renderer)"
      :render-fn="renderer"
      :field="field"
      :value="modelValue"
      :on-change="handleInput"
    />

    <div
      v-else
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
    >
      <p class="text-sm text-red-600">
        {{ t('configPanels.unknownFieldType') }} <code class="font-mono">{{ field.type }}</code>
      </p>
    </div>
  </div>
</template>
