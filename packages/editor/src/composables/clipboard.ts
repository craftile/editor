import { computed, inject } from 'vue';
import { useCraftileEngine } from './craftile-engine';
import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

export function useClipboard() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);
  if (!editor) {
    throw new Error('useClipboard must be used within a component that has access to CraftileEditor');
  }

  const { engine, pasteBlock } = useCraftileEngine();
  const uiManager = editor.ui;

  const copiedBlock = computed(() => uiManager.state.clipboard.copiedBlock);
  const hasCopiedBlock = computed(() => copiedBlock.value !== null);

  function copyBlock(blockId: string): void {
    try {
      const structure = engine.exportBlockAsNestedStructure(blockId);
      uiManager.copyBlock(structure);
    } catch (error) {
      console.error('Failed to copy block:', error);
    }
  }

  function canPasteAfter(targetBlockId: string): boolean {
    const copied = copiedBlock.value;
    if (!copied) {
      return false;
    }

    const targetBlock = engine.getBlockById(targetBlockId);
    if (!targetBlock) {
      return false;
    }

    if (targetBlock.parentId) {
      const parentBlock = engine.getBlockById(targetBlock.parentId);
      if (!parentBlock) {
        return false;
      }

      const blocksManager = engine.getBlocksManager();
      if (!blocksManager.canBeChild(copied.type, parentBlock.type)) {
        return false;
      }

      if (parentBlock.static) {
        return false;
      }
    }

    return true;
  }

  function pasteBlockAfter(targetBlockId: string): void {
    const copied = copiedBlock.value;
    if (!copied || !canPasteAfter(targetBlockId)) {
      return;
    }

    const targetBlock = engine.getBlockById(targetBlockId)!;
    const parentId = targetBlock.parentId;
    let index: number | undefined;

    if (parentId) {
      const parent = engine.getBlockById(parentId)!;

      const targetIndex = parent.children.indexOf(targetBlockId);
      index = targetIndex + 1;

      pasteBlock(copied, { parentId, index });
    } else {
      const page = engine.getPage();
      for (const region of page.regions) {
        const targetIndex = region.blocks.indexOf(targetBlockId);
        if (targetIndex !== -1) {
          index = targetIndex + 1;
          pasteBlock(copied, { regionName: region.name, index });
          break;
        }
      }
    }
  }

  function clearClipboard(): void {
    uiManager.clearClipboard();
  }

  return {
    copiedBlock,
    hasCopiedBlock,
    copyBlock,
    canPasteAfter,
    pasteBlockAfter,
    clearClipboard,
  };
}
