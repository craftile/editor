import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';
import type { DevicePreset } from '../managers/devices';

export function useDeviceMode() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useDeviceMode must be used within a component that has access to CraftileEditor');
  }

  return {
    currentDevice: computed(() => editor.devices.state.currentDevice),
    currentDeviceData: computed(() => editor.devices.getCurrentDeviceData()),
    savedCustomDevices: computed(() => editor.devices.state.savedCustomDevices),
    devicePresets: editor.devices.devicePresets,

    setDeviceMode: (deviceId: string) => editor.devices.setDeviceMode(deviceId),
    addCustomDevice: (devicePreset: DevicePreset) => editor.devices.addCustomDevice(devicePreset),
    removeCustomDevice: (deviceId: string) => editor.devices.removeCustomDevice(deviceId),
    getAllDevices: () => editor.devices.getAllDevices(),
  };
}
