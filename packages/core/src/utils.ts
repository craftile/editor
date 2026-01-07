import type { Region } from '@craftile/types';

export const generateId = (): string => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Get the unique identifier for a region.
 * Falls back to name if id is not provided.
 */
export const getRegionId = (region: Region): string => {
  return region.id || region.name;
};
