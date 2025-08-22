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
}

export type EngineEmitFn = <K extends keyof EngineEvents>(event: K, data: EngineEvents[K]) => void;
