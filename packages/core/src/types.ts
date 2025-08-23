import type { Block, BlockSchema } from '@craftile/types';
import type { BlocksManager } from './blocks-manager';

export interface Region {
  name: string;
  blocks: string[]; // Array of block IDs in this region
}

export interface Page {
  blocks: Record<string, Block>; // all blocks flatened by ID
  regions?: Region[];
}

export interface EngineConfig {
  page?: Page;
  blockSchemas?: BlockSchema[];
  blocksManager?: BlocksManager;
}

export interface Command {
  apply(): void;
  revert(): void;
}

// Event system types
export interface EngineEvents {
  'page:set': { previousPage?: Page; newPage: Page };
  'block:insert': { blockId: string; block: Block; parentId?: string; index?: number; regionName?: string };
  'block:remove': { blockId: string; block: Block; parentId?: string };
  'block:toggle': { blockId: string; disabled: boolean; oldValue?: boolean };
  'block:property:set': { blockId: string; key: string; value: any; oldValue: any };
  'block:move': {
    blockId: string;
    targetParentId?: string;
    targetIndex?: number;
    targetRegionName?: string;
    sourceParentId?: string | null;
    sourceRegionName?: string | null;
    sourceIndex: number;
  };
}

export type EngineEmitFn = <K extends keyof EngineEvents>(
  event: K,
  ...args: EngineEvents[K] extends void ? [] : [EngineEvents[K]]
) => void;
