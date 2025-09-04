import { type ComputedRef } from 'vue';

import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { SidebarPanel } from '../types/ui';

export interface UseUIReturn {
  sidebarPanels: ComputedRef<SidebarPanel[]>;
  activeSidebarPanel: ComputedRef<string>;

  setActiveSidebarPanel: (panel: string) => void;
}

export function useUI(): UseUIReturn {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useUI must be used within a component that has access to CraftileEditor');
  }

  const setActiveSidebarPanel = (panel: string) => {
    editor.ui.state.activeSidebarPanel = panel;
  };

  return {
    sidebarPanels: computed(() => editor.ui.state.sidebarPanels),
    activeSidebarPanel: computed(() => editor.ui.state.activeSidebarPanel),

    setActiveSidebarPanel,
  };
}
