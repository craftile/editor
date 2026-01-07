import { getRegionId } from '@craftile/core';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

export function useSelectedBlock() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useSelectedBlock must be used within a component that has access to CraftileEditor');
  }

  const { regions, blocks, moveBlock, duplicateBlock, toggleBlock, removeBlock } = useCraftileEngine();

  const hasSelection = computed(() => !!editor.ui.state.selectedBlockId);
  const selectedBlockId = computed(() => editor.ui.state.selectedBlockId);
  const selectedBlock = computed(() =>
    editor.ui.state.selectedBlockId ? blocks.value[editor.ui.state.selectedBlockId] || null : null
  );

  const selectBlock = (blockId: string | null) => {
    editor.ui.setSelectedBlock(blockId);
  };

  const clearSelection = () => {
    editor.ui.clearSelectedBlock();
    editor.inspector.clearSelectedBlock();
  };

  const positionInfo = computed(() => {
    if (!selectedBlock.value) {
      return null;
    }

    const block = selectedBlock.value;

    for (const region of regions.value) {
      const blockIndex = region.blocks.indexOf(block.id);
      if (blockIndex !== -1) {
        return {
          parentType: 'region',
          parentId: getRegionId(region),
          currentIndex: blockIndex,
          siblingCount: region.blocks.length,
        };
      }
    }

    if (block.parentId) {
      const parentBlock = blocks.value[block.parentId];
      if (parentBlock) {
        const blockIndex = parentBlock.children.indexOf(block.id);
        if (blockIndex !== -1) {
          return {
            parentType: 'block',
            parentId: block.parentId,
            currentIndex: blockIndex,
            siblingCount: parentBlock.children.length,
          };
        }
      }
    }

    return null;
  });

  const canMoveToPrevious = computed(() => {
    if (!selectedBlock.value || selectedBlock.value?.static) {
      return false;
    }

    return positionInfo.value && positionInfo.value.currentIndex > 0;
  });

  const canMoveToNext = computed(() => {
    if (!selectedBlock.value || selectedBlock.value?.static) {
      return false;
    }

    return positionInfo.value && positionInfo.value.currentIndex < positionInfo.value.siblingCount - 1;
  });

  const moveToPrevious = () => {
    if (!selectedBlock.value || !positionInfo.value) {
      return;
    }

    const newIndex = positionInfo.value.currentIndex - 1;

    if (positionInfo.value.parentType === 'region') {
      moveBlock(selectedBlock.value.id, {
        targetRegionId: positionInfo.value.parentId,
        targetIndex: newIndex,
      });
    } else if (positionInfo.value.parentType === 'block') {
      moveBlock(selectedBlock.value.id, {
        targetParentId: positionInfo.value.parentId,
        targetIndex: newIndex,
      });
    }
  };

  const moveToNext = () => {
    if (!selectedBlock.value || !positionInfo.value) {
      return;
    }

    const newIndex = positionInfo.value.currentIndex + 1;

    if (positionInfo.value.parentType === 'region') {
      moveBlock(selectedBlock.value.id, {
        targetRegionId: positionInfo.value.parentId,
        targetIndex: newIndex,
      });
    } else if (positionInfo.value.parentType === 'block') {
      moveBlock(selectedBlock.value.id, {
        targetParentId: positionInfo.value.parentId,
        targetIndex: newIndex,
      });
    }
  };

  const duplicate = () => {
    if (selectedBlockId.value) {
      duplicateBlock(selectedBlockId.value);
    }
  };

  const toggle = () => {
    if (selectedBlockId.value) {
      toggleBlock(selectedBlockId.value);
    }
  };

  const remove = () => {
    if (selectedBlockId.value) {
      removeBlock(selectedBlockId.value);
      clearSelection();
    }
  };

  return {
    hasSelection,
    selectedBlockId,
    selectedBlock,
    canMoveToPrevious,
    canMoveToNext,

    selectBlock,
    clearSelection,

    moveToPrevious,
    moveToNext,
    duplicate,
    toggle,
    remove,
  };
}
