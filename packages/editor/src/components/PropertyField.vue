<script setup lang="ts">
import type { PropertyField } from '@craftile/types';
import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';
import ResponsivePropertyField from './ResponsivePropertyField.vue';

interface Props {
  field: PropertyField;
  modelValue: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const { propertyFields: propertyFieldConfigs } = useUI();

const { currentDevice, devicePresets, setDeviceMode } = useDeviceMode();

const availableDevices = computed(() => {
  const baseDevice = { id: '_default', label: 'All devices', width: 0, icon: 'desktop' };
  const otherDevices = devicePresets.filter((d) => d.id !== 'fit');
  return [baseDevice, ...otherDevices];
});

const responsiveCurrentDevice = computed(() => {
  return currentDevice.value === 'fit' ? '_default' : currentDevice.value;
});

const fieldRenderer = computed(() => {
  const config = propertyFieldConfigs.value.get(props.field.type);
  return config?.render;
});

const handleInput = (value: any) => {
  emit('update:modelValue', value);
};

// Handle device change from responsive field
const handleDeviceChange = (deviceId: string) => {
  const globalDeviceId = deviceId === '_default' ? 'fit' : deviceId;
  setDeviceMode(globalDeviceId);
};
</script>
<template>
  <!-- Responsive Field Wrapper -->
  <ResponsivePropertyField
    v-if="field.responsive"
    :field="field"
    :model-value="modelValue"
    :current-device="responsiveCurrentDevice"
    :available-devices="availableDevices"
    @update:model-value="handleInput"
    @change-device="handleDeviceChange"
  />

  <!-- Regular Field -->
  <div v-else>
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
