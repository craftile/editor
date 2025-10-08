<script setup lang="ts">
import { Select, createListCollection } from '@ark-ui/vue/select';
import ComputerDesktopIcon from '~icons/heroicons/computer-desktop';
import DeviceTabletIcon from '~icons/heroicons/device-tablet';
import DevicePhoneMobileIcon from '~icons/heroicons/device-phone-mobile';
import type { PropertyField } from '@craftile/types';
import type { DevicePreset } from '../managers/devices';
import {
  isResponsiveValue,
  getDeviceValue,
  setDeviceValue,
  hasDeviceOverride,
  clearDeviceOverride,
} from '../utils/responsive';
import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';

interface Props {
  field: PropertyField;
  modelValue: any;
  currentDevice: string;
  availableDevices: DevicePreset[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: any];
  changeDevice: [deviceId: string];
}>();

// Icon map for devices
const iconComponents: Record<string, any> = {
  desktop: ComputerDesktopIcon,
  tablet: DeviceTabletIcon,
  mobile: DevicePhoneMobileIcon,
};

const getIconComponent = (iconName?: string) => {
  return iconComponents[iconName || 'desktop'] || ComputerDesktopIcon;
};

const currentDeviceData = computed(() => {
  return props.availableDevices.find((d) => d.id === props.currentDevice) || props.availableDevices[0];
});

const hasOverride = computed(() => {
  return hasDeviceOverride(props.modelValue, props.currentDevice);
});

const currentValue = computed(() => {
  return getDeviceValue(props.modelValue, props.currentDevice);
});

const handleValueUpdate = (newValue: any) => {
  const responsiveValue = setDeviceValue(props.modelValue, props.currentDevice, newValue);
  emit('update:modelValue', responsiveValue);
};

const handleClearOverride = () => {
  if (!isResponsiveValue(props.modelValue)) return;

  const updated = clearDeviceOverride(props.modelValue, props.currentDevice);
  emit('update:modelValue', updated);
};

const handleDeviceSelect = (details: { value: string[] }) => {
  const [deviceId] = details.value;
  if (deviceId && deviceId !== props.currentDevice) {
    emit('changeDevice', deviceId);
  }
};

const deviceCollection = computed(() => {
  return createListCollection({
    items: props.availableDevices.map((device) => ({
      label: device.label,
      value: device.id,
      icon: device.icon,
    })),
  });
});

const { propertyFields: propertyFieldConfigs } = useUI();

const fieldRenderer = computed(() => {
  const config = propertyFieldConfigs.value.get(props.field.type);
  return config?.render;
});
</script>

<template>
  <div class="relative">
    <div class="flex items-center justify-end gap-3 absolute right-0 top-0 z-5">
      <Tooltip title="Reset to default value">
        <button
          v-if="hasOverride"
          @click="handleClearOverride"
          class="hover:text-gray-600 text-gray-400 transition-colors cursor-pointer"
        >
          <icon-arrow-uturn-right class="w-3 h-3 rotate-180" />
        </button>
      </Tooltip>

      <Tooltip v-if="hasOverride" title="Customized for this breakpoint">
        <div class="size-1.5 bg-green-800 rotate-45" />
      </Tooltip>

      <!-- Device Selector -->
      <Select.Root :model-value="[currentDevice]" :collection="deviceCollection" @value-change="handleDeviceSelect">
        <Select.Trigger class="flex items-center gap-1 relative">
          <component :is="getIconComponent(currentDeviceData.icon)" class="w-4 h-4 text-gray-600" />
        </Select.Trigger>

        <Select.Positioner>
          <Select.Content class="bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[160px] z-50">
            <Select.Item
              v-for="item in deviceCollection.items"
              :key="item.value"
              :item="item"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer data-[state=checked]:bg-accent/10 data-[state=checked]:text-accent"
            >
              <Select.ItemText class="flex items-center gap-2">
                <component :is="getIconComponent(item.icon)" class="w-4 h-4" />
                {{ item.label }}
              </Select.ItemText>

              <!-- Check indicator for selected -->
              <Select.ItemIndicator class="ml-auto">
                <icon-check class="w-4 h-4 text-accent" />
              </Select.ItemIndicator>
            </Select.Item>
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </div>

    <div>
      <component
        v-if="isVueComponent(fieldRenderer) || isComponentString(fieldRenderer)"
        :is="fieldRenderer"
        :field="field"
        :model-value="currentValue"
        @update:model-value="handleValueUpdate"
      />

      <!-- Framework-Agnostic Render Function -->
      <PropertyFieldRenderWrapper
        v-else-if="isHtmlRenderFunction(fieldRenderer)"
        :render-fn="fieldRenderer"
        :field="field"
        :value="currentValue"
        :on-change="handleValueUpdate"
      />

      <div v-else class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">
          Unknown field type: <code class="font-mono">{{ field.type }}</code>
        </p>
      </div>
    </div>
  </div>
</template>
