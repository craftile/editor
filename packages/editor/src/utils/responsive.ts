import type { ResponsiveValue } from '@craftile/types';

/**
 * Check if a value is a responsive value object
 */
export function isResponsiveValue(value: any): value is ResponsiveValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && '_default' in value;
}

/**
 * Get value for a specific device, falling back to _default if not set
 * @param value - The property value (responsive or simple)
 * @param deviceId - The device preset ID
 * @returns The value for the device or the base value
 */
export function getDeviceValue<T = any>(value: ResponsiveValue<T> | T, deviceId: string): T {
  if (!isResponsiveValue(value)) {
    return value;
  }

  // Map 'fit' device to '_default'
  if (deviceId === 'fit') {
    deviceId = '_default';
  }

  // Return device-specific value if set, otherwise return _default
  return value[deviceId] !== undefined ? value[deviceId] : value._default;
}

/**
 * Set value for a specific device
 * Converts simple values to responsive format if needed
 * @param currentValue - The current property value
 * @param deviceId - The device preset ID
 * @param newValue - The new value to set for this device
 * @returns Updated responsive value
 */
export function setDeviceValue<T = any>(
  currentValue: ResponsiveValue<T> | T,
  deviceId: string,
  newValue: T
): ResponsiveValue<T> {
  // Convert to responsive format if needed
  const responsiveValue = isResponsiveValue(currentValue) ? { ...currentValue } : { _default: currentValue as T };

  // Map 'fit' device to '_default'
  if (deviceId === 'fit') {
    deviceId = '_default';
  }

  // Set the value for the device
  responsiveValue[deviceId] = newValue;

  return responsiveValue;
}

/**
 * Check if a device has a custom override value
 * @param value - The property value
 * @param deviceId - The device preset ID
 * @returns true if the device has a custom value
 */
export function hasDeviceOverride(value: any, deviceId: string): boolean {
  if (!isResponsiveValue(value)) {
    return false;
  }

  if (deviceId === 'fit' || deviceId === '_default') {
    return false;
  }

  return deviceId in value;
}

/**
 * Clear device override (remove device-specific value)
 * The device will inherit from _default after this
 * @param value - The responsive value
 * @param deviceId - The device preset ID to clear
 * @returns Updated responsive value without the device override
 */
export function clearDeviceOverride<T = any>(value: ResponsiveValue<T>, deviceId: string): ResponsiveValue<T> {
  // Cannot clear _default or fit
  if (deviceId === '_default' || deviceId === 'fit') {
    return value;
  }

  // Remove the device key
  const { [deviceId]: _, ...rest } = value;
  return rest as ResponsiveValue<T>;
}

/**
 * Get list of all devices that have custom overrides
 * @param value - The responsive value
 * @returns Array of device IDs that have custom values
 */
export function getOverriddenDevices(value: ResponsiveValue): string[] {
  return Object.keys(value).filter((key) => key !== '_default');
}
