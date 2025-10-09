import type { Engine } from '@craftile/core';
import type { Block, MoveInstruction, UpdatesEvent } from '@craftile/types';

export interface WatchEngineUpdatesOptions {
  debounceMs?: number;
  onUpdates: (updates: UpdatesEvent) => void;
}

/**
 * Watch engine events and emit aggregated updates
 *
 * @param engine The Craftile engine instance
 * @param options Configuration options
 *
 * @returns Cleanup function to remove all listeners
 */
export function watchEngineUpdates(engine: Engine, options?: WatchEngineUpdatesOptions) {
  const pendingChanges = {
    added: new Set<string>(),
    updated: new Set<string>(),
    removed: new Set<string>(),
    moved: new Map<string, MoveInstruction>(),
    blocksToInclude: new Set<string>(), // All blocks that need to be in the blocks object
  };

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  const cleanupFunctions: (() => void)[] = [];

  const emitUpdates = () => {
    if (
      pendingChanges.added.size ||
      pendingChanges.updated.size ||
      pendingChanges.removed.size ||
      pendingChanges.moved.size
    ) {
      const page = engine.getPage();

      // For blocks that are repeated or have repeated ancestors, include their parent
      // so renderers can regenerate parent HTML to update all repeated instances
      const blocksToCheck = Array.from(pendingChanges.blocksToInclude);
      blocksToCheck.forEach((blockId) => {
        const block = page.blocks[blockId];
        // Walk up parent chain to find first repeated block
        let currentBlock: Block | undefined = block;
        while (currentBlock) {
          if (currentBlock.repeated && currentBlock.parentId) {
            // Found a repeated block - include its parent
            pendingChanges.blocksToInclude.add(currentBlock.parentId);
            break;
          }

          // Move to parent
          currentBlock = currentBlock.parentId ? page.blocks[currentBlock.parentId] : undefined;
        }
      });

      const dirtyBlocks: Record<string, Block> = {};

      pendingChanges.blocksToInclude.forEach((id) => {
        if (page.blocks[id]) {
          dirtyBlocks[id] = structuredClone(page.blocks[id]);
        }
      });

      options?.onUpdates({
        blocks: dirtyBlocks,
        regions: structuredClone(page.regions),
        changes: {
          added: Array.from(pendingChanges.added),
          updated: Array.from(pendingChanges.updated),
          removed: Array.from(pendingChanges.removed),
          moved: Object.fromEntries(pendingChanges.moved),
        },
      });

      pendingChanges.added.clear();
      pendingChanges.updated.clear();
      pendingChanges.removed.clear();
      pendingChanges.moved.clear();
      pendingChanges.blocksToInclude.clear();
    }
  };

  const scheduleEmit = () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(emitUpdates, options?.debounceMs || 0);
  };

  const addBlockWithDescendants = (blockId: string, target: Set<string>) => {
    target.add(blockId);

    const page = engine.getPage();
    const block = page.blocks[blockId];

    if (block?.children) {
      block.children.forEach((childId) => {
        addBlockWithDescendants(childId, target);
      });
    }
  };

  cleanupFunctions.push(
    engine.on('block:insert', ({ blockId, parentId }) => {
      pendingChanges.added.add(blockId);

      // Include block and all its descendants in the update (for presets with nested children)
      addBlockWithDescendants(blockId, pendingChanges.blocksToInclude);

      if (parentId) {
        pendingChanges.blocksToInclude.add(parentId);
      }

      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:remove', ({ blockId, parentId }) => {
      pendingChanges.added.delete(blockId);
      pendingChanges.updated.delete(blockId);
      pendingChanges.removed.add(blockId);
      pendingChanges.blocksToInclude.delete(blockId);

      if (parentId) {
        pendingChanges.blocksToInclude.add(parentId);
      }

      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:property:set', ({ blockId }) => {
      if (!pendingChanges.added.has(blockId)) {
        pendingChanges.updated.add(blockId);
      }

      pendingChanges.blocksToInclude.add(blockId);
      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:move', ({ blockId, sourceParentId, targetParentId, targetIndex, targetRegionName }) => {
      pendingChanges.moved.set(blockId, {
        toRegion: targetRegionName,
        toParent: targetParentId,
        toIndex: targetIndex ?? 0,
      });

      pendingChanges.blocksToInclude.add(blockId);

      if (sourceParentId) {
        pendingChanges.blocksToInclude.add(sourceParentId);
      }

      if (targetParentId) {
        pendingChanges.blocksToInclude.add(targetParentId);
      }

      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:toggle', ({ blockId }) => {
      if (!pendingChanges.added.has(blockId)) {
        pendingChanges.updated.add(blockId);
      }

      pendingChanges.blocksToInclude.add(blockId);

      // Include parent block for positioning context when re-enabling
      const page = engine.getPage();
      const block = page.blocks[blockId];
      if (block?.parentId) {
        pendingChanges.blocksToInclude.add(block.parentId);
      }

      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:duplicate', ({ newBlockId, parentId }) => {
      pendingChanges.added.add(newBlockId);

      addBlockWithDescendants(newBlockId, pendingChanges.blocksToInclude);

      if (parentId) {
        pendingChanges.blocksToInclude.add(parentId);
      }

      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:update', ({ blockId }) => {
      if (!pendingChanges.added.has(blockId)) {
        pendingChanges.updated.add(blockId);
      }

      pendingChanges.blocksToInclude.add(blockId);
      scheduleEmit();
    })
  );

  return () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}
