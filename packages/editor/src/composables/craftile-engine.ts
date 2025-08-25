import { useBlocksEngine, type UseBlocksEngineReturn } from '@craftile/core/vue';
import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

export function useCraftileEngine(): UseBlocksEngineReturn {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useCraftileEngine must be used within a component that has access to CraftileEditor');
  }

  return useBlocksEngine(editor.engine);
}
