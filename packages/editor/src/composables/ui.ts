import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

export function useUI() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useUI must be used within a component that has access to CraftileEditor');
  }

  const setActiveSidebarPanel = (panel: string) => {
    editor.ui.state.activeSidebarPanel = panel;
  };

  return {
    toaster: editor.ui.toaster,
    sidebarPanels: computed(() => editor.ui.state.sidebarPanels),
    activeSidebarPanel: computed(() => editor.ui.state.activeSidebarPanel),
    registerSidebarPanel: editor.ui.registerSidebarPanel.bind(editor.ui),
    removeSidebarPanel: editor.ui.removeSidebarPanel.bind(editor.ui),
    setActiveSidebarPanel,

    headerActions: computed(() => editor.ui.state.headerActions),
    registerHeaderAction: editor.ui.registerHeaderAction.bind(editor.ui),
    removeHeaderAction: editor.ui.removeHeaderAction.bind(editor.ui),

    configurationPanels: computed(() => editor.ui.state.configurationPanels),
    registerConfigurationPanel: editor.ui.registerConfigurationPanel.bind(editor.ui),
    removeConfigurationPanel: editor.ui.removeConfigurationPanel.bind(editor.ui),

    propertyFields: computed(() => editor.ui.state.propertyFields),
    registerPropertyField: editor.ui.registerPropertyField.bind(editor.ui),
  };
}
