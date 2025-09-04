import { type ComputedRef } from 'vue';

import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { HeaderAction, SidebarPanel } from '../types/ui';

export interface UseUIReturn {
  sidebarPanels: ComputedRef<SidebarPanel[]>;
  activeSidebarPanel: ComputedRef<string>;
  registerSidebarPanel: (panel: SidebarPanel) => void;
  removeSidebarPanel: (panelId: string) => void;

  headerActions: ComputedRef<HeaderAction[]>;
  registerHeaderAction: (action: HeaderAction) => void;
  removeHeaderAction: (actionId: string) => void;

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
    registerSidebarPanel: editor.ui.registerSidebarPanel.bind(editor.ui),
    removeSidebarPanel: editor.ui.removeSidebarPanel.bind(editor.ui),
    setActiveSidebarPanel,

    headerActions: computed(() => editor.ui.state.headerActions),
    registerHeaderAction: editor.ui.registerHeaderAction.bind(editor.ui),
    removeHeaderAction: editor.ui.removeHeaderAction.bind(editor.ui),
  };
}
