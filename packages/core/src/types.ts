import type { Block, BlockSchema, Page } from '@craftile/types';
import type { BlocksManager } from './blocks-manager';

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
  'block:duplicate': {
    originalBlockId: string;
    newBlockId: string;
    newBlock: Block;
    parentId?: string;
    index?: number;
    regionName?: string;
  };
  undo: { command: any };
  redo: { command: any };
}

export type EngineEmitFn = <K extends keyof EngineEvents>(
  event: K,
  ...args: EngineEvents[K] extends void ? [] : [EngineEvents[K]]
) => void;
