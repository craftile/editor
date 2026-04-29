const CUSTOM_DEVICES_STORAGE_KEY = 'craftile-editor:custom-devices';

export interface DevicePreset {
  id: string;
  label: string;
  width: number;
  icon?: string;
}

interface DevicesState {
  currentDevice: string;
  savedCustomDevices: DevicePreset[];
}

export interface DevicesManagerOptions {
  presets?: DevicePreset[];
  default?: string;
}

export class DevicesManager {
  public readonly state: DevicesState;
  public readonly devicePresets: DevicePreset[];

  constructor(options: DevicesManagerOptions = {}) {
    const fitDevice: DevicePreset = { id: 'fit', label: 'Auto', width: 0, icon: 'desktop' };

    const customPresets = options.presets?.filter((preset) => preset.id !== 'fit');

    if (customPresets && customPresets.length > 0) {
      this.devicePresets = [fitDevice, ...customPresets];
    } else {
      this.devicePresets = [
        fitDevice,
        { id: 'desktop', label: 'Desktop', width: 1440, icon: 'desktop' },
        { id: 'laptop', label: 'Laptop', width: 1024, icon: 'desktop' },
        { id: 'tablet', label: 'Tablet', width: 768, icon: 'tablet' },
        { id: 'mobile', label: 'Mobile', width: 375, icon: 'mobile' },
        { id: 'mobile-sm', label: 'Small Mobile', width: 320, icon: 'mobile' },
      ];
    }

    const defaultDevice = options.default || 'fit';
    const deviceExists = this.devicePresets.some((preset) => preset.id === defaultDevice);

    this.state = reactive({
      currentDevice: deviceExists ? defaultDevice : 'fit',
      savedCustomDevices: this.loadCustomDevices(),
    });
  }

  getCurrentDeviceData(): DevicePreset {
    // First check built-in presets
    const preset = this.devicePresets.find((p) => p.id === this.state.currentDevice);
    if (preset) {
      return preset;
    }

    // Then check custom devices
    const customDevice = this.state.savedCustomDevices.find((p) => p.id === this.state.currentDevice);
    if (customDevice) {
      return customDevice;
    }

    return this.devicePresets[0];
  }

  setDeviceMode(deviceId: string): void {
    this.state.currentDevice = deviceId;
  }

  addCustomDevice(device: DevicePreset): void {
    if (this.state.savedCustomDevices.some((d) => d.id === device.id)) {
      return;
    }

    this.state.savedCustomDevices.push(device);
    this.saveCustomDevices();
  }

  removeCustomDevice(deviceId: string): void {
    const index = this.state.savedCustomDevices.findIndex((d) => d.id === deviceId);

    if (index > -1) {
      this.state.savedCustomDevices.splice(index, 1);
    }

    if (this.state.currentDevice === deviceId) {
      this.state.currentDevice = 'fit';
    }

    this.saveCustomDevices();
  }

  getAllDevices(): DevicePreset[] {
    return [...this.devicePresets, ...this.state.savedCustomDevices];
  }

  private loadCustomDevices(): DevicePreset[] {
    try {
      const raw = localStorage.getItem(CUSTOM_DEVICES_STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item): item is DevicePreset =>
          item !== null &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.label === 'string' &&
          typeof item.width === 'number' &&
          (item.icon === undefined || typeof item.icon === 'string')
      );
    } catch {
      return [];
    }
  }

  private saveCustomDevices(): void {
    try {
      localStorage.setItem(CUSTOM_DEVICES_STORAGE_KEY, JSON.stringify(this.state.savedCustomDevices));
    } catch {
      // localStorage may throw on quota / disabled storage; non-fatal
    }
  }
}
