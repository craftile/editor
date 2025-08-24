import { ref, onUnmounted, computed, toRaw, nextTick, type Ref } from 'vue';
import { Engine } from '../engine';
import type { EngineConfig, Page, Region } from '../types';
import type { Block } from '@craftile/types';

export interface UseBlocksEngineOptions extends EngineConfig {
  autoSync?: boolean;
}

export interface UseBlocksEngineFromInstanceOptions {
  autoSync?: boolean;
}

export interface UseBlocksEngineReturn {
  engine: Engine;

  page: Ref<Page>;
  blocks: Ref<Record<string, Block>>;
  regions: Ref<Region[]>;

  rootLevelBlocks: Ref<Block[]>;

  getBlockById: (id: string) => Block | undefined;
  getBlocksByType: (type: string) => Block[];
  getChildrenBlocks: (parentId: string) => Block[];

  insertBlock: (
    blockType: string,
    options?: {
      parentId?: string;
      regionName?: string;
      index?: number;
    }
  ) => string;
  removeBlock: (blockId: string) => void;
  moveBlock: (
    blockId: string,
    options: {
      targetParentId?: string;
      targetIndex?: number;
      targetRegionName?: string;
    }
  ) => void;
  setBlockProperty: (blockId: string, propertyKey: string, propertyValue: any) => void;
  toggleBlock: (blockId: string, disabled?: boolean) => void;
  duplicateBlock: (blockId: string) => string;

  undo: () => boolean;
  redo: () => boolean;
  canUndo: Ref<boolean>;
  canRedo: Ref<boolean>;

  refresh: () => void;
  destroy: () => void;
}

/**
 * Vue composable for reactive integration with Blocks Engine
 *
 * @param options Configuration options for the engine and composable
 * @returns Reactive interface to the blocks engine
 */
export function useBlocksEngine(options?: UseBlocksEngineOptions): UseBlocksEngineReturn;

/**
 * Vue composable for reactive integration with existing Blocks Engine
 *
 * @param engine Existing engine instance to wrap with reactive features
 * @param options Options for the composable behavior
 * @returns Reactive interface to the blocks engine
 */
export function useBlocksEngine(engine: Engine, options?: UseBlocksEngineFromInstanceOptions): UseBlocksEngineReturn;

export function useBlocksEngine(
  configOrEngine?: UseBlocksEngineOptions | Engine,
  instanceOptions?: UseBlocksEngineFromInstanceOptions
): UseBlocksEngineReturn {
  const isEngineInstance = configOrEngine instanceof Engine;
  let engine: Engine;
  let autoSync: boolean;

  if (isEngineInstance) {
    engine = configOrEngine;
    autoSync = instanceOptions?.autoSync ?? true;
  } else {
    const config = configOrEngine || {};
    const { autoSync: configAutoSync = true, ...engineConfig } = config;
    engine = new Engine(engineConfig);
    autoSync = configAutoSync;
  }

  const pageState = ref<Page>({
    blocks: {},
    regions: [{ name: 'main', blocks: [] }],
  });
  const blocks = computed(() => pageState.value.blocks);
  const regions = computed(() => pageState.value.regions!);

  const canUndo = ref(engine.canUndo());
  const canRedo = ref(engine.canRedo());

  const rootLevelBlocks = computed(() => {
    const rootLevel: Block[] = [];

    for (const region of regions.value!) {
      for (const blockId of region.blocks) {
        const block = blocks.value[blockId];

        if (block) {
          rootLevel.push(block);
        }
      }
    }

    return rootLevel;
  });

  const getBlockById = (id: string): Block | undefined => {
    return blocks.value[id];
  };

  const getBlocksByType = (type: string): Block[] => {
    return Object.values(blocks.value).filter((block: Block) => {
      return block.type === type;
    });
  };

  const getChildrenBlocks = (parentId: string): Block[] => {
    const parent = blocks.value[parentId];

    if (!parent) {
      return [];
    }

    return parent.children.map((childId: string) => blocks.value[childId]).filter(Boolean) as Block[];
  };

  const syncStateFromEngine = () => {
    const rawPage = toRaw(engine.getPage());
    pageState.value = rawPage;

    // Defer history state updates to next tick to ensure command is added to history first
    nextTick(() => {
      canUndo.value = engine.canUndo();
      canRedo.value = engine.canRedo();
    });
  };

  syncStateFromEngine();

  const eventCleanups: Array<() => void> = [];

  if (autoSync) {
    const eventTypes = [
      'page:set',
      'block:insert',
      'block:remove',
      'block:move',
      'block:toggle',
      'block:duplicate',
      'block:property:set',
      'undo',
      'redo',
    ] as const;

    eventTypes.forEach((eventType) => {
      const cleanup = engine.on(eventType, () => {
        syncStateFromEngine();
      });

      eventCleanups.push(cleanup);
    });
  }

  const insertBlock = (
    blockType: string,
    options?: {
      parentId?: string;
      regionName?: string;
      index?: number;
    }
  ): string => {
    const blockId = engine.insertBlock(blockType, options);

    if (!autoSync) {
      syncStateFromEngine();
    }

    return blockId;
  };

  const removeBlock = (blockId: string): void => {
    engine.removeBlock(blockId);

    if (!autoSync) {
      syncStateFromEngine();
    }
  };

  const moveBlock = (
    blockId: string,
    options: {
      targetParentId?: string;
      targetIndex?: number;
      targetRegionName?: string;
    }
  ): void => {
    engine.moveBlock(blockId, options);

    if (!autoSync) {
      syncStateFromEngine();
    }
  };

  const setBlockProperty = (blockId: string, propertyKey: string, propertyValue: any): void => {
    engine.setBlockProperty(blockId, propertyKey, propertyValue);

    if (!autoSync) {
      syncStateFromEngine();
    }
  };

  const toggleBlock = (blockId: string, disabled?: boolean): void => {
    engine.toggleBlock(blockId, disabled);

    if (!autoSync) {
      syncStateFromEngine();
    }
  };

  const duplicateBlock = (blockId: string): string => {
    const newBlockId = engine.duplicateBlock(blockId);

    if (!autoSync) {
      syncStateFromEngine();
    }

    return newBlockId;
  };

  const undo = (): boolean => {
    const result = engine.undo();

    if (!autoSync) {
      syncStateFromEngine();
    }

    return result;
  };

  const redo = (): boolean => {
    const result = engine.redo();

    if (!autoSync) {
      syncStateFromEngine();
    }

    return result;
  };

  const refresh = () => {
    syncStateFromEngine();
  };

  const destroy = () => {
    eventCleanups.forEach((cleanup) => cleanup());
    eventCleanups.length = 0;
  };

  onUnmounted(() => {
    destroy();
  });

  return {
    // Reactive state
    page: pageState,
    blocks,
    regions,

    // Engine instance
    engine,

    // Computed helpers
    rootLevelBlocks,
    getBlockById,
    getBlocksByType,
    getChildrenBlocks,

    // Command methods
    insertBlock,
    removeBlock,
    moveBlock,
    setBlockProperty,
    toggleBlock,
    duplicateBlock,

    // History methods
    undo,
    redo,
    canUndo,
    canRedo,

    // Utility methods
    refresh,
    destroy,
  };
}
