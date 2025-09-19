<script setup lang="ts">
import { Popover } from '@ark-ui/vue/popover';
import ComputerDesktopIcon from '~icons/heroicons/computer-desktop';
import DeviceTabletIcon from '~icons/heroicons/device-tablet';
import DevicePhoneMobileIcon from '~icons/heroicons/device-phone-mobile';

const { t } = useI18n();
const {
  currentDevice,
  currentDeviceData,
  devicePresets,
  savedCustomDevices,
  setDeviceMode,
  addCustomDevice,
  removeCustomDevice,
} = useDeviceMode();

const showDropdown = ref(false);
const customWidth = ref(768);

const iconsMap: Record<string, any> = {
  desktop: ComputerDesktopIcon,
  tablet: DeviceTabletIcon,
  mobile: DevicePhoneMobileIcon,
};

const getIconComponent = (iconName?: string) => {
  return iconsMap[iconName || 'desktop'] || ComputerDesktopIcon;
};

const getDeviceIcon = () => {
  return getIconComponent(currentDeviceData.value.icon);
};

const handleSetDeviceMode = (deviceId: string) => {
  setDeviceMode(deviceId);
  showDropdown.value = false;
};

const applyCustomDevice = () => {
  const id = `custom-${customWidth.value}`;
  addCustomDevice({
    id,
    label: `${t('common.custom')} ${customWidth.value}px`,
    width: customWidth.value,
  });

  setDeviceMode(id);
  showDropdown.value = false;
};

const handleRemoveCustomDevice = (deviceId: string) => {
  removeCustomDevice(deviceId);
};
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<template>
  <Popover.Root v-model:open="showDropdown" :positioning="{ placement: 'top-end', gutter: 0 }">
    <Popover.Trigger as-child>
      <UiButton class="gap-1">
        <component :is="getDeviceIcon()" class="device-icon" />
        <span class="text-xs whitespace-nowrap capitalize max-w-[120px] overflow-hidden text-ellipsis">
          {{ currentDeviceData.label }}
        </span>

        <Popover.Indicator as-child>
          <icon-chevron-down class="w-3.5 h-3.5 transition-transform duration-200 data-[state=open]:rotate-180" />
        </Popover.Indicator>
      </UiButton>
    </Popover.Trigger>
    <Popover.Positioner>
      <Popover.Content class="w-72 border shadow-xs overflow-hidden mt-1 rounded-lg bg-white">
        <div class="flex items-center justify-between px-4 py-3 border-b border-solid">
          <h4 class="text-sm font-semibold text-gray-900 m-0">{{ t('header.devicePreview') }}</h4>
          <Popover.CloseTrigger as-child>
            <button
              class="rounded cursor-pointer text-gray-500 transition-all duration-200 flex items-center justify-center p-1 hover:text-gray-700"
            >
              <icon-x-mark class="w-4 h-4" />
            </button>
          </Popover.CloseTrigger>
        </div>

        <div class="flex flex-col gap-1 p-2">
          <button
            v-for="device in devicePresets"
            :key="device.id"
            class="flex items-center gap-2 cursor-pointer text-left text-sm text-gray-700 transition-[background] duration-[0.2s] px-3 py-2.5 rounded-md border-[none]"
            :class="{ 'text-accent! bg-accent/8': currentDevice === device.id }"
            @click="handleSetDeviceMode(device.id)"
          >
            <component :is="getIconComponent(device.icon)" class="w-5 h-5" />
            <span>{{ device.label }}</span>
            <span class="text-xs ml-auto">{{ device.width === 0 ? t('header.auto') : device.width + 'px' }}</span>
          </button>
        </div>

        <div class="px-4 py-3 border-t">
          <h5 class="text-[13px] font-semibold text-gray-700 mt-0 mb-3 mx-0">{{ t('header.customDeviceSize') }}</h5>
          <div class="flex flex-wrap gap-2">
            <div class="flex-1">
              <label for="custom-width" class="block text-xs text-gray-500 mb-1">
                {{ t('header.deviceWidthPx') }}
              </label>
              <input
                v-model="customWidth"
                type="number"
                id="custom-width"
                min="320"
                max="2560"
                class="w-full border rounded text-sm px-3 py-2"
              />
            </div>
            <button
              class="w-full text-accent-foreground bg-accent rounded text-[13px] font-medium cursor-pointer transition-[background] duration-[0.2s] mt-2 p-2 border-[none]"
              @click="applyCustomDevice"
            >
              {{ t('header.apply') }}
            </button>
          </div>

          <div class="mt-4">
            <h5>{{ t('header.savedCustomDevices') }}</h5>
            <div class="flex flex-col gap-1 mt-2">
              <div
                v-for="(device, index) in savedCustomDevices"
                :key="index"
                role="button"
                class="flex items-center gap-2 rounded text-left text-sm text-gray-700 px-3 py-2 cursor-pointer"
                :class="{ 'text-accent! bg-accent/8': currentDevice === `custom-${device.width}` }"
                @click="handleSetDeviceMode(`custom-${device.width}`)"
              >
                <icon-device-tablet class="w-5 h-5 flex-none" />
                <span class="flex-1">{{ device.width }}px</span>
                <button
                  class="flex-none rounded cursor-pointer text-gray-500 flex items-center justify-center transition-all duration-[0.2s] p-1 border-[none] hover:text-red-600"
                  @click.stop="handleRemoveCustomDevice(device.id)"
                >
                  <icon-x-mark />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Popover.Content>
    </Popover.Positioner>
  </Popover.Root>
</template>
