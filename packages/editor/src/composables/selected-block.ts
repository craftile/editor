import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

export function useSelectedBlock() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useSelectedBlock must be used within a component that has access to CraftileEditor');
  }

  return {
    hasSelection: computed(() => !!editor.ui.state.selectedBlockId),
    selectedBlockId: computed(() => editor.ui.state.selectedBlockId),
    selectedBlock: computed(() =>
      editor.ui.state.selectedBlockId ? editor.engine.getBlockById(editor.ui.state.selectedBlockId) : null
    ),

    selectBlock: (blockId: string | null) => {
      editor.ui.setSelectedBlock(blockId);
    },

    clearSelection: () => {
      editor.ui.clearSelectedBlock();
    },
  };
}
