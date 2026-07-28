import type { Block, Page, Region } from '@craftile/types';

export type ResolvedTarget =
  | { kind: 'parent'; parent: Block; index: number }
  | { kind: 'region'; regionId: string; index: number };

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

/**
 * Clamp `index` to a valid splice position for an array of `length`. An
 * undefined or out-of-range index falls back to `length` (i.e. append).
 */
export const clampIndex = (length: number, index: number | undefined): number => {
  return index !== undefined && index >= 0 && index <= length ? index : length;
};

/**
 * Resolve the effective region id, falling back to the first region or to
 * `'main'` when none exist. Safe against an empty `page.regions` array.
 */
export const resolveRegionId = (page: Page, regionId: string | undefined): string => {
  return regionId || (page.regions[0] && getRegionId(page.regions[0])) || 'main';
};

/**
 * Resolve the target parent/region and the splice index, asserting the
 * dynamic-child placement rules.
 */
export const resolveInsertTarget = (
  page: Page,
  parentId: string | undefined,
  regionId: string | undefined,
  index: number | undefined
): ResolvedTarget => {
  if (parentId) {
    const parent = page.blocks[parentId];
    if (!parent) {
      throw new Error(`Parent block not found: ${parentId}`);
    }
    const resolvedIndex = clampIndex(parent.children.length, index);
    if (!canInsertDynamicChildAt(parent.children, page.blocks, resolvedIndex)) {
      throw new Error(`Cannot place at index ${resolvedIndex} of ${parentId}: not a valid slot for a dynamic child`);
    }
    return { kind: 'parent', parent, index: resolvedIndex };
  }

  const targetRegionId = resolveRegionId(page, regionId);
  const existing = page.regions.find((r) => getRegionId(r) === targetRegionId);
  if (!existing) {
    throw new Error(`Region not found: ${targetRegionId}`);
  }

  return {
    kind: 'region',
    regionId: targetRegionId,
    index: clampIndex(existing.blocks.length, index),
  };
};

/**
 * Returns true when inserting a dynamic block at `index` of the given children
 * keeps all dynamic siblings contiguous and does not wedge between two adjacent
 * static blocks.
 */
export const canInsertDynamicChildAt = (
  childrenIds: string[],
  blocks: Record<string, Block>,
  index: number
): boolean => {
  if (index > 0 && index < childrenIds.length) {
    const before = blocks[childrenIds[index - 1]];
    const after = blocks[childrenIds[index]];
    if (before?.static === true && after?.static === true) {
      return false;
    }
  }

  let first = -1;
  let last = -1;
  for (let i = 0; i < childrenIds.length; i++) {
    const child = blocks[childrenIds[i]];
    if (child && child.static !== true) {
      if (first === -1) {
        first = i;
      }
      last = i;
    }
  }
  if (first === -1) {
    return true;
  }
  return index >= first && index <= last + 1;
};
