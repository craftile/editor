import type { Engine } from '@craftile/core';
import type { Block, BlockPosition, MoveInstruction, Page, UpdatesEvent } from '@craftile/types';

function resolveBlockPosition(blockId: string, page: Page): BlockPosition | undefined {
  const block = page.blocks[blockId];
  if (!block) {
    return;
  }

  let siblings: string[];
  let parentId: string | undefined;
  let regionId: string | undefined;

  if (block.parentId) {
    const parent = page.blocks[block.parentId];
    if (!parent) {
      return;
    }
    parentId = block.parentId;
    siblings = parent.children;
  } else {
    const region = page.regions.find((r) => r.blocks.includes(blockId));
    if (!region) {
      return;
    }
    regionId = region.id || region.name;
    siblings = region.blocks;
  }

  const index = siblings.indexOf(blockId);
  if (index === -1) {
    return;
  }

  let afterId: string | undefined;
  let beforeId: string | undefined;

  for (let i = index - 1; i >= 0; i--) {
    const sibling = page.blocks[siblings[i]];
    if (sibling && !sibling.disabled) {
      afterId = siblings[i];
      break;
    }
  }

  for (let i = index + 1; i < siblings.length; i++) {
    const sibling = page.blocks[siblings[i]];
    if (sibling && !sibling.disabled) {
      beforeId = siblings[i];
      break;
    }
  }

  return { parentId, regionId, afterId, beforeId };
}

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
    positions: new Set<string>(),
    blocksToInclude: new Set<string>(), // All blocks that need to be in the blocks object
    removedBlocks: new Map<string, Block>(),
  };

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  const cleanupFunctions: (() => void)[] = [];

  const clearPendingChanges = () => {
    pendingChanges.added.clear();
    pendingChanges.updated.clear();
    pendingChanges.removed.clear();
    pendingChanges.moved.clear();
    pendingChanges.positions.clear();
    pendingChanges.blocksToInclude.clear();
    pendingChanges.removedBlocks.clear();
  };

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
        let currentBlock: Block | undefined = block;

        while (currentBlock) {
          if (currentBlock.repeated && currentBlock.parentId) {
            pendingChanges.blocksToInclude.add(currentBlock.parentId);
            break;
          }

          // Move to parent
          currentBlock = currentBlock.parentId ? page.blocks[currentBlock.parentId] : undefined;
        }
      });

      const dirtyBlocks: Record<string, Block> = {};

      pendingChanges.removedBlocks.forEach((block, id) => {
        dirtyBlocks[id] = structuredClone(block);
      });

      pendingChanges.blocksToInclude.forEach((id) => {
        if (page.blocks[id]) {
          dirtyBlocks[id] = structuredClone(page.blocks[id]);
        }
      });

      const positions: Record<string, BlockPosition> = {};
      pendingChanges.positions.forEach((id) => {
        const position = resolveBlockPosition(id, page);
        if (position) {
          positions[id] = position;
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
          positions,
        },
      });

      clearPendingChanges();
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

  const getRootBlockIds = (page: Page): string[] => {
    return page.regions.flatMap((region) => region.blocks);
  };

  const emitPageReplaceUpdate = (previousPage: Page, newPage: Page) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }

    clearPendingChanges();

    const previousRootIds = getRootBlockIds(previousPage);
    const newRootIds = getRootBlockIds(newPage);
    const blocks: Record<string, Block> = structuredClone(newPage.blocks);

    previousRootIds.forEach((blockId) => {
      const block = previousPage.blocks[blockId];
      if (block && !blocks[blockId]) {
        blocks[blockId] = structuredClone(block);
      }
    });

    const positions: Record<string, BlockPosition> = {};
    newRootIds.forEach((blockId) => {
      const position = resolveBlockPosition(blockId, newPage);
      if (position) {
        positions[blockId] = position;
      }
    });

    options?.onUpdates({
      blocks,
      regions: structuredClone(newPage.regions),
      changes: {
        added: newRootIds,
        updated: [],
        removed: previousRootIds,
        moved: {},
        positions,
      },
    });
  };

  cleanupFunctions.push(
    engine.on('page:replace', ({ previousPage, newPage }) => {
      emitPageReplaceUpdate(previousPage, newPage);
    })
  );

  cleanupFunctions.push(
    engine.on('block:insert', ({ blockId, parentId }) => {
      pendingChanges.added.add(blockId);
      pendingChanges.positions.add(blockId);

      // Include block and all its descendants in the update (for presets with nested children)
      addBlockWithDescendants(blockId, pendingChanges.blocksToInclude);

      if (parentId) {
        pendingChanges.blocksToInclude.add(parentId);
      }

      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:remove', ({ blockId, block, parentId }) => {
      pendingChanges.added.delete(blockId);
      pendingChanges.updated.delete(blockId);
      pendingChanges.positions.delete(blockId);
      pendingChanges.removed.add(blockId);
      pendingChanges.blocksToInclude.delete(blockId);
      pendingChanges.removedBlocks.set(blockId, block);

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
    engine.on('block:move', ({ blockId, sourceParentId, targetParentId, targetIndex, targetRegionId }) => {
      pendingChanges.moved.set(blockId, {
        toRegion: targetRegionId,
        toParent: targetParentId,
        toIndex: targetIndex ?? 0,
      });
      pendingChanges.positions.add(blockId);

      pendingChanges.blocksToInclude.add(blockId);

      if (sourceParentId) {
        pendingChanges.blocksToInclude.add(sourceParentId);
      }

      if (targetParentId) {
        pendingChanges.blocksToInclude.add(targetParentId);
      }

      // When the moved block lives in (or used to live in) a repeated context,
      // a preview client doing an optimistic single-element DOM move would corrupt
      // sibling rendered instances. Mark parents as updated so consumers skip the
      // optimistic move and rely on the html-effects refresh.
      const page = engine.getPage();
      const inRepeatedContext = (startId: string | null | undefined): boolean => {
        let current: Block | undefined = startId ? page.blocks[startId] : undefined;
        while (current) {
          if (current.repeated) return true;
          current = current.parentId ? page.blocks[current.parentId] : undefined;
        }
        return false;
      };

      if (inRepeatedContext(blockId) || inRepeatedContext(sourceParentId)) {
        if (sourceParentId && !pendingChanges.added.has(sourceParentId)) {
          pendingChanges.updated.add(sourceParentId);
        }
        if (targetParentId && !pendingChanges.added.has(targetParentId)) {
          pendingChanges.updated.add(targetParentId);
        }
      }

      scheduleEmit();
    })
  );

  cleanupFunctions.push(
    engine.on('block:toggle', ({ blockId }) => {
      if (!pendingChanges.added.has(blockId)) {
        pendingChanges.updated.add(blockId);
      }

      pendingChanges.positions.add(blockId);
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
      pendingChanges.positions.add(newBlockId);

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
